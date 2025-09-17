import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportConfig {
  format: 'csv' | 'json' | 'pdf' | 'excel';
  dateRange: {
    from: string;
    to: string;
  };
  dataTypes: string[];
  includeCharts: boolean;
  groupBy: 'keyword' | 'asin' | 'date' | 'marketplace';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, config }: { userId: string; config: ExportConfig } = await req.json();
    
    console.log(`Processing export request for user: ${userId}`);

    // Collect data based on selected types
    const exportData: any = {};

    for (const dataType of config.dataTypes) {
      switch (dataType) {
        case 'rankings':
          exportData.rankings = await fetchRankingsData(supabase, userId, config.dateRange);
          break;
        case 'performance':
          exportData.performance = await fetchPerformanceData(supabase, userId, config.dateRange);
          break;
        case 'usage':
          exportData.usage = await fetchUsageData(supabase, userId, config.dateRange);
          break;
        case 'jobs':
          exportData.jobs = await fetchJobsData(supabase, userId);
          break;
        case 'errors':
          exportData.errors = await fetchErrorData(supabase, userId, config.dateRange);
          break;
      }
    }

    // Format data according to requested format
    let formattedData: string;
    let filename: string;

    switch (config.format) {
      case 'csv':
        formattedData = formatAsCSV(exportData, config.groupBy);
        filename = `amazon-keyword-report-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      
      case 'json':
        formattedData = JSON.stringify(exportData, null, 2);
        filename = `amazon-keyword-report-${new Date().toISOString().split('T')[0]}.json`;
        break;
      
      case 'excel':
        formattedData = await formatAsExcel(exportData, config);
        filename = `amazon-keyword-report-${new Date().toISOString().split('T')[0]}.xlsx`;
        break;
      
      case 'pdf':
        formattedData = await formatAsPDF(exportData, config);
        filename = `amazon-keyword-report-${new Date().toISOString().split('T')[0]}.pdf`;
        break;
      
      default:
        throw new Error(`Unsupported format: ${config.format}`);
    }

    // Log export activity
    await supabase.from('export_history').insert({
      user_id: userId,
      format: config.format,
      data_types: config.dataTypes,
      date_range: config.dateRange,
      filename
    });

    return new Response(JSON.stringify({ 
      success: true, 
      exportedData: formattedData,
      filename
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in export-data function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchRankingsData(supabase: any, userId: string, dateRange: any) {
  const { data, error } = await supabase
    .from('position_history')
    .select(`
      *,
      tracking_jobs!inner(*)
    `)
    .eq('tracking_jobs.user_id', userId)
    .gte('tracked_at', dateRange.from)
    .lte('tracked_at', dateRange.to)
    .order('tracked_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function fetchPerformanceData(supabase: any, userId: string, dateRange: any) {
  const { data, error } = await supabase
    .from('api_requests')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', dateRange.from)
    .lte('created_at', dateRange.to)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function fetchUsageData(supabase: any, userId: string, dateRange: any) {
  const { data, error } = await supabase.functions.invoke('proxy-helper-functions', {
    body: {
      type: 'get_data_usage_stats',
      p_user_id: userId
    }
  });

  if (error) throw error;
  return data?.data || {};
}

async function fetchJobsData(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('tracking_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function fetchErrorData(supabase: any, userId: string, dateRange: any) {
  const { data, error } = await supabase
    .from('api_requests')
    .select('*')
    .eq('user_id', userId)
    .eq('success', false)
    .gte('created_at', dateRange.from)
    .lte('created_at', dateRange.to)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

function formatAsCSV(data: any, groupBy: string): string {
  const csvLines: string[] = [];
  
  // Handle rankings data
  if (data.rankings && data.rankings.length > 0) {
    csvLines.push('--- KEYWORD RANKINGS ---');
    csvLines.push('Keyword,ASIN,Marketplace,Organic Position,Sponsored Position,Search Volume,Competition Level,Tracked At');
    
    data.rankings.forEach((ranking: any) => {
      csvLines.push([
        ranking.keyword,
        ranking.tracking_jobs?.asin || '',
        ranking.tracking_jobs?.marketplace || '',
        ranking.organic_position || '',
        ranking.sponsored_position || '',
        ranking.search_volume || '',
        ranking.competition_level || '',
        ranking.tracked_at
      ].join(','));
    });
    csvLines.push('');
  }

  // Handle performance data
  if (data.performance && data.performance.length > 0) {
    csvLines.push('--- PERFORMANCE DATA ---');
    csvLines.push('Timestamp,Success,Response Time (ms),Keyword,Marketplace,Error Message');
    
    data.performance.forEach((perf: any) => {
      csvLines.push([
        perf.created_at,
        perf.success,
        perf.response_time_ms || '',
        perf.keyword || '',
        perf.marketplace || '',
        (perf.error_message || '').replace(/,/g, ';')
      ].join(','));
    });
    csvLines.push('');
  }

  // Handle jobs data
  if (data.jobs && data.jobs.length > 0) {
    csvLines.push('--- TRACKING JOBS ---');
    csvLines.push('ASIN,Keywords,Marketplace,Status,Frequency,Created At,Last Tracked');
    
    data.jobs.forEach((job: any) => {
      csvLines.push([
        job.asin,
        (job.keywords || []).join(';'),
        job.marketplace,
        job.status,
        job.tracking_frequency,
        job.created_at,
        job.last_tracked_at || ''
      ].join(','));
    });
  }

  return csvLines.join('\n');
}

async function formatAsExcel(data: any, config: ExportConfig): Promise<string> {
  // For simplicity, return CSV format
  // In a real implementation, you'd use a library like xlsx
  return formatAsCSV(data, config.groupBy);
}

async function formatAsPDF(data: any, config: ExportConfig): Promise<string> {
  // For simplicity, return formatted text
  // In a real implementation, you'd use a PDF generation library
  let pdfContent = `Amazon Keyword Tracking Report\nGenerated: ${new Date().toISOString()}\n\n`;
  
  if (data.rankings && data.rankings.length > 0) {
    pdfContent += `KEYWORD RANKINGS (${data.rankings.length} records)\n`;
    pdfContent += '='.repeat(50) + '\n\n';
    
    data.rankings.slice(0, 10).forEach((ranking: any) => {
      pdfContent += `Keyword: ${ranking.keyword}\n`;
      pdfContent += `ASIN: ${ranking.tracking_jobs?.asin}\n`;
      pdfContent += `Organic Position: ${ranking.organic_position || 'Not found'}\n`;
      pdfContent += `Sponsored Position: ${ranking.sponsored_position || 'Not found'}\n`;
      pdfContent += `Tracked: ${new Date(ranking.tracked_at).toLocaleString()}\n\n`;
    });
  }

  return pdfContent;
}