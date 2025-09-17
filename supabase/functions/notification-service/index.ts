import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'tracking_complete' | 'tracking_failed' | 'system_alert';
  userId: string;
  data: {
    jobId?: string;
    jobName?: string;
    keywords?: string[];
    results?: any[];
    error?: string;
    message?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, userId, data }: NotificationRequest = await req.json();
    
    console.log(`Processing notification: ${type} for user: ${userId}`);

    // Get user profile for notification preferences
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new Error(`Error fetching user profile: ${profileError.message}`);
    }

    let notificationContent = '';
    let subject = '';

    switch (type) {
      case 'tracking_complete':
        subject = `Tracking Complete - ${data.jobName || 'Amazon Keywords'}`;
        notificationContent = generateTrackingCompleteMessage(data);
        break;
      
      case 'tracking_failed':
        subject = `Tracking Failed - ${data.jobName || 'Amazon Keywords'}`;
        notificationContent = generateTrackingFailedMessage(data);
        break;
      
      case 'system_alert':
        subject = 'System Alert - Amazon Keyword Tracker';
        notificationContent = data.message || 'System alert notification';
        break;
      
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    // Store notification in database for in-app notifications
    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title: subject,
        message: notificationContent,
        data: data,
        read: false
      });

    if (insertError) {
      console.error('Error storing notification:', insertError);
    }

    // For now, just log the notification (in production, you'd send emails/webhooks)
    console.log('Notification sent:', {
      userId,
      email: profile.email,
      subject,
      content: notificationContent
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Notification sent successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in notification-service:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateTrackingCompleteMessage(data: any): string {
  const { keywords = [], results = [] } = data;
  const totalKeywords = keywords.length;
  const successfulResults = results.filter((r: any) => r.organicPosition !== null || r.sponsoredPosition !== null).length;
  
  let message = `Your tracking job has completed successfully!\n\n`;
  message += `📊 Results Summary:\n`;
  message += `• Keywords tracked: ${totalKeywords}\n`;
  message += `• Successful results: ${successfulResults}\n`;
  message += `• Success rate: ${Math.round((successfulResults / totalKeywords) * 100)}%\n\n`;
  
  if (results.length > 0) {
    message += `🔍 Top Results:\n`;
    results.slice(0, 5).forEach((result: any) => {
      const organicPos = result.organicPosition ? `#${result.organicPosition}` : 'Not found';
      const sponsoredPos = result.sponsoredPosition ? `#${result.sponsoredPosition} (Sponsored)` : '';
      message += `• "${result.keyword}": ${organicPos} ${sponsoredPos}\n`;
    });
  }
  
  return message;
}

function generateTrackingFailedMessage(data: any): string {
  const { keywords = [], error } = data;
  
  let message = `Your tracking job has failed.\n\n`;
  message += `❌ Error Details:\n`;
  message += `• Keywords: ${keywords.join(', ')}\n`;
  message += `• Error: ${error || 'Unknown error occurred'}\n\n`;
  message += `The system will automatically retry the job later.`;
  
  return message;
}