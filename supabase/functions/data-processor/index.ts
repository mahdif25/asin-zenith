import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsData {
  trackingJobId: string;
  keyword: string;
  currentOrganicPosition: number | null;
  currentSponsoredPosition: number | null;
  organicTrend: 'up' | 'down' | 'stable' | 'new';
  sponsoredTrend: 'up' | 'down' | 'stable' | 'new';
  organicChange: number;
  sponsoredChange: number;
  avgOrganicPosition: number | null;
  avgSponsoredPosition: number | null;
  bestOrganicPosition: number | null;
  bestSponsoredPosition: number | null;
  worstOrganicPosition: number | null;
  worstSponsoredPosition: number | null;
  totalTracked: number;
  lastSevenDaysChange: number | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Running data processor...');

    // Get all active tracking jobs
    const { data: trackingJobs, error: jobsError } = await supabase
      .from('tracking_jobs')
      .select('id, user_id, asin, keywords')
      .eq('status', 'active');

    if (jobsError) {
      throw new Error(`Error fetching tracking jobs: ${jobsError.message}`);
    }

    console.log(`Processing analytics for ${trackingJobs?.length || 0} jobs`);

    if (!trackingJobs || trackingJobs.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No active jobs to process',
        processedJobs: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let processedJobs = 0;
    const allAnalytics: AnalyticsData[] = [];

    for (const job of trackingJobs) {
      try {
        console.log(`Processing analytics for job ${job.id}`);

        for (const keyword of job.keywords) {
          const analytics = await processKeywordAnalytics(supabase, job.id, keyword);
          if (analytics) {
            allAnalytics.push(analytics);
          }
        }

        processedJobs++;
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
      }
    }

    // Calculate overall statistics
    const totalKeywords = allAnalytics.length;
    const improving = allAnalytics.filter(a => 
      (a.organicTrend === 'up' || a.sponsoredTrend === 'up') && 
      (a.organicTrend !== 'down' && a.sponsoredTrend !== 'down')
    ).length;
    const declining = allAnalytics.filter(a => 
      (a.organicTrend === 'down' || a.sponsoredTrend === 'down') && 
      (a.organicTrend !== 'up' && a.sponsoredTrend !== 'up')
    ).length;
    const stable = totalKeywords - improving - declining;

    console.log(`Data processor completed: ${processedJobs} jobs, ${totalKeywords} keywords analyzed`);
    console.log(`Trends: ${improving} improving, ${declining} declining, ${stable} stable`);

    return new Response(JSON.stringify({ 
      success: true, 
      processedJobs,
      totalKeywords,
      trends: {
        improving,
        declining,
        stable
      },
      analytics: allAnalytics.slice(0, 100) // Return first 100 for response size management
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in data-processor function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processKeywordAnalytics(
  supabase: any, 
  trackingJobId: string, 
  keyword: string
): Promise<AnalyticsData | null> {
  try {
    // Get recent position history for this keyword (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: history, error } = await supabase
      .from('position_history')
      .select('*')
      .eq('tracking_job_id', trackingJobId)
      .eq('keyword', keyword)
      .gte('tracked_at', thirtyDaysAgo.toISOString())
      .order('tracked_at', { ascending: false });

    if (error || !history || history.length === 0) {
      console.log(`No history found for job ${trackingJobId}, keyword: ${keyword}`);
      return null;
    }

    const currentEntry = history[0];
    const previousEntry = history[1] || null;

    // Calculate trends
    const organicTrend = calculateTrend(
      previousEntry?.organic_position, 
      currentEntry.organic_position
    );
    const sponsoredTrend = calculateTrend(
      previousEntry?.sponsored_position, 
      currentEntry.sponsored_position
    );

    // Calculate changes
    const organicChange = calculateChange(
      previousEntry?.organic_position, 
      currentEntry.organic_position
    );
    const sponsoredChange = calculateChange(
      previousEntry?.sponsored_position, 
      currentEntry.sponsored_position
    );

    // Calculate statistics
    const organicPositions = history
      .map(h => h.organic_position)
      .filter(p => p !== null) as number[];
    
    const sponsoredPositions = history
      .map(h => h.sponsored_position)
      .filter(p => p !== null) as number[];

    // Calculate 7-day change
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentHistory = history.filter(h => 
      new Date(h.tracked_at) >= sevenDaysAgo
    );
    const lastSevenDaysChange = calculateSevenDayChange(recentHistory);

    const analytics: AnalyticsData = {
      trackingJobId,
      keyword,
      currentOrganicPosition: currentEntry.organic_position,
      currentSponsoredPosition: currentEntry.sponsored_position,
      organicTrend,
      sponsoredTrend,
      organicChange,
      sponsoredChange,
      avgOrganicPosition: organicPositions.length > 0 
        ? Math.round(organicPositions.reduce((a, b) => a + b, 0) / organicPositions.length)
        : null,
      avgSponsoredPosition: sponsoredPositions.length > 0
        ? Math.round(sponsoredPositions.reduce((a, b) => a + b, 0) / sponsoredPositions.length)
        : null,
      bestOrganicPosition: organicPositions.length > 0 ? Math.min(...organicPositions) : null,
      bestSponsoredPosition: sponsoredPositions.length > 0 ? Math.min(...sponsoredPositions) : null,
      worstOrganicPosition: organicPositions.length > 0 ? Math.max(...organicPositions) : null,
      worstSponsoredPosition: sponsoredPositions.length > 0 ? Math.max(...sponsoredPositions) : null,
      totalTracked: history.length,
      lastSevenDaysChange
    };

    return analytics;

  } catch (error) {
    console.error(`Error processing analytics for ${trackingJobId}/${keyword}:`, error);
    return null;
  }
}

function calculateTrend(
  previousPosition: number | null, 
  currentPosition: number | null
): 'up' | 'down' | 'stable' | 'new' {
  if (previousPosition === null && currentPosition !== null) return 'new';
  if (previousPosition === null || currentPosition === null) return 'stable';
  
  const change = previousPosition - currentPosition; // Lower position number = better rank
  
  if (change > 2) return 'up';      // Improved by more than 2 positions
  if (change < -2) return 'down';   // Declined by more than 2 positions
  return 'stable';
}

function calculateChange(
  previousPosition: number | null, 
  currentPosition: number | null
): number {
  if (previousPosition === null || currentPosition === null) return 0;
  return previousPosition - currentPosition; // Positive = improvement
}

function calculateSevenDayChange(recentHistory: any[]): number | null {
  if (recentHistory.length < 2) return null;
  
  const latest = recentHistory[0];
  const oldest = recentHistory[recentHistory.length - 1];
  
  if (!latest.organic_position || !oldest.organic_position) return null;
  
  return oldest.organic_position - latest.organic_position; // Positive = improvement
}