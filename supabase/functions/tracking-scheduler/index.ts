import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Running tracking scheduler...');

    // Get all active tracking jobs that are due for tracking
    const { data: trackingJobs, error: jobsError } = await supabase
      .from('tracking_jobs')
      .select('*')
      .eq('status', 'active')
      .or(`next_tracking_at.is.null,next_tracking_at.lte.${new Date().toISOString()}`)
      .limit(50); // Process max 50 jobs per run

    if (jobsError) {
      throw new Error(`Error fetching tracking jobs: ${jobsError.message}`);
    }

    console.log(`Found ${trackingJobs?.length || 0} jobs ready for tracking`);

    if (!trackingJobs || trackingJobs.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No jobs ready for tracking',
        processedJobs: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let processedJobs = 0;
    let successfulJobs = 0;

    // Process jobs in randomized order for anti-detection
    const shuffledJobs = trackingJobs.sort(() => Math.random() - 0.5);

    for (const job of shuffledJobs) {
      try {
        console.log(`Processing job ${job.id} for ASIN: ${job.asin}`);

        // Call the amazon-scraper function with user context
        const scrapeResponse = await fetch(`${supabaseUrl}/functions/v1/amazon-scraper`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            asin: job.asin,
            keywords: job.keywords,
            marketplace: job.marketplace,
            trackingJobId: job.id,
            userId: job.user_id
          })
        });

        const scrapeResult = await scrapeResponse.json();

        if (scrapeResult.success && scrapeResult.results) {
          // Store results in position_history
          const historyEntries = scrapeResult.results.map((result: any) => ({
            tracking_job_id: job.id,
            keyword: result.keyword,
            organic_position: result.organicPosition,
            sponsored_position: result.sponsoredPosition,
            search_volume: result.searchVolume,
            competition_level: result.competitionLevel,
            tracked_at: new Date().toISOString()
          }));

          const { error: historyError } = await supabase
            .from('position_history')
            .insert(historyEntries);

          if (historyError) {
            throw new Error(`Error storing history: ${historyError.message}`);
          }

          successfulJobs++;
          console.log(`Successfully processed job ${job.id}`);

          // Send success notification
          try {
            await fetch(`${supabaseUrl}/functions/v1/notification-service`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                type: 'tracking_complete',
                userId: job.user_id,
                data: {
                  jobId: job.id,
                  jobName: `${job.asin} Tracking`,
                  keywords: job.keywords,
                  results: scrapeResult.results
                }
              })
            });
          } catch (notifError) {
            console.error(`Error sending notification for job ${job.id}:`, notifError);
          }
        } else {
          console.error(`Scraping failed for job ${job.id}:`, scrapeResult.error);
          
          // Send failure notification
          try {
            await fetch(`${supabaseUrl}/functions/v1/notification-service`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                type: 'tracking_failed',
                userId: job.user_id,
                data: {
                  jobId: job.id,
                  jobName: `${job.asin} Tracking`,
                  keywords: job.keywords,
                  error: scrapeResult.error
                }
              })
            });
          } catch (notifError) {
            console.error(`Error sending failure notification for job ${job.id}:`, notifError);
          }
        }

        // Update job's last_tracked_at and next_tracking_at
        const nextTrackingAt = calculateNextTrackingTime(job.tracking_frequency);
        
        const { error: updateError } = await supabase
          .from('tracking_jobs')
          .update({
            last_tracked_at: new Date().toISOString(),
            next_tracking_at: nextTrackingAt
          })
          .eq('id', job.id);

        if (updateError) {
          console.error(`Error updating job ${job.id}:`, updateError.message);
        }

        processedJobs++;

        // Random delay between job processing (5-15 seconds)
        const delay = Math.floor(Math.random() * 10000) + 5000;
        await new Promise(resolve => setTimeout(resolve, delay));

      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        
        // Mark job as failed if too many consecutive failures
        const { error: updateError } = await supabase
          .from('tracking_jobs')
          .update({
            status: 'failed',
            last_tracked_at: new Date().toISOString()
          })
          .eq('id', job.id);

        if (updateError) {
          console.error(`Error updating failed job ${job.id}:`, updateError.message);
        }
      }
    }

    console.log(`Tracking scheduler completed: ${processedJobs} processed, ${successfulJobs} successful`);

    return new Response(JSON.stringify({ 
      success: true, 
      processedJobs,
      successfulJobs,
      failedJobs: processedJobs - successfulJobs
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in tracking-scheduler function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateNextTrackingTime(frequency: string): string {
  const now = new Date();
  
  switch (frequency) {
    case 'hourly':
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    case 'every_6_hours':
      return new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  }
}