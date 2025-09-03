import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapeRequest {
  asin: string;
  keywords: string[];
  marketplace: string;
  trackingJobId: string;
}

interface ScrapingResult {
  keyword: string;
  organicPosition: number | null;
  sponsoredPosition: number | null;
  searchVolume: number | null;
  competitionLevel: string;
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

    const { asin, keywords, marketplace, trackingJobId }: ScrapeRequest = await req.json();
    
    console.log(`Starting scrape for ASIN: ${asin}, Keywords: ${keywords.join(', ')}, Marketplace: ${marketplace}`);

    const results: ScrapingResult[] = [];
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ];

    // Get marketplace URL
    const marketplaceUrls: Record<string, string> = {
      'US': 'https://www.amazon.com',
      'UK': 'https://www.amazon.co.uk',
      'DE': 'https://www.amazon.de',
      'FR': 'https://www.amazon.fr',
      'IT': 'https://www.amazon.it',
      'ES': 'https://www.amazon.es',
      'CA': 'https://www.amazon.ca',
      'JP': 'https://www.amazon.co.jp',
      'AU': 'https://www.amazon.com.au',
      'IN': 'https://www.amazon.in',
      'MX': 'https://www.amazon.com.mx',
      'BR': 'https://www.amazon.com.br'
    };

    const baseUrl = marketplaceUrls[marketplace] || marketplaceUrls['US'];

    // Process each keyword with random delays
    for (const keyword of keywords) {
      console.log(`Scraping keyword: ${keyword}`);
      
      try {
        // Random delay between requests (20-30 seconds)
        const delay = Math.floor(Math.random() * 10000) + 20000;
        await new Promise(resolve => setTimeout(resolve, delay));

        const searchUrl = `${baseUrl}/s?k=${encodeURIComponent(keyword)}&ref=sr_pg_1`;
        const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent': randomUserAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
          }
        });

        console.log(`Response status for ${keyword}: ${response.status}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        
        // Parse HTML to find product positions
        const organicPosition = findProductPosition(html, asin, 'organic');
        const sponsoredPosition = findProductPosition(html, asin, 'sponsored');
        
        // Estimate search volume and competition (placeholder logic)
        const searchVolume = estimateSearchVolume(html);
        const competitionLevel = assessCompetitionLevel(html);

        results.push({
          keyword,
          organicPosition,
          sponsoredPosition,
          searchVolume,
          competitionLevel
        });

        // Log API request for rate limiting tracking
        await supabase.from('api_requests').insert({
          user_id: null, // Will be set by the calling function
          tracking_job_id: trackingJobId,
          marketplace,
          keyword,
          success: true,
          response_time_ms: Date.now(),
          user_agent: randomUserAgent
        });

        console.log(`Successfully scraped ${keyword}: Organic: ${organicPosition}, Sponsored: ${sponsoredPosition}`);

      } catch (error) {
        console.error(`Error scraping keyword ${keyword}:`, error);
        
        // Log failed request
        await supabase.from('api_requests').insert({
          user_id: null,
          tracking_job_id: trackingJobId,
          marketplace,
          keyword,
          success: false,
          error_message: error.message,
          response_time_ms: Date.now()
        });

        // Continue with other keywords even if one fails
        results.push({
          keyword,
          organicPosition: null,
          sponsoredPosition: null,
          searchVolume: null,
          competitionLevel: 'unknown'
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      results,
      totalKeywords: keywords.length,
      successfulScrapess: results.filter(r => r.organicPosition !== null || r.sponsoredPosition !== null).length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in amazon-scraper function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions for parsing Amazon HTML
function findProductPosition(html: string, asin: string, type: 'organic' | 'sponsored'): number | null {
  try {
    // This is a simplified approach - in production, you'd need more sophisticated parsing
    const regex = type === 'sponsored' 
      ? new RegExp(`data-asin="${asin}"[^>]*data-component-type="sp-sponsored-result"`, 'gi')
      : new RegExp(`data-asin="${asin}"(?![^>]*data-component-type="sp-sponsored-result")`, 'gi');
    
    const matches = [...html.matchAll(regex)];
    if (matches.length === 0) return null;

    // Find position by counting preceding products
    const firstMatch = matches[0];
    const beforeMatch = html.substring(0, firstMatch.index);
    const productCount = (beforeMatch.match(type === 'sponsored' ? /data-component-type="sp-sponsored-result"/g : /data-asin="[^"]+"/g) || []).length;
    
    return productCount + 1;
  } catch (error) {
    console.error(`Error finding ${type} position:`, error);
    return null;
  }
}

function estimateSearchVolume(html: string): number | null {
  try {
    // Look for search result count indicators
    const resultCountMatch = html.match(/(\d+(?:,\d+)*)\s*results?/i);
    if (resultCountMatch) {
      const count = parseInt(resultCountMatch[1].replace(/,/g, ''));
      // Rough estimation based on result count
      return Math.min(Math.max(Math.floor(count / 100), 100), 10000);
    }
    return null;
  } catch (error) {
    console.error('Error estimating search volume:', error);
    return null;
  }
}

function assessCompetitionLevel(html: string): string {
  try {
    // Count sponsored results as competition indicator
    const sponsoredCount = (html.match(/data-component-type="sp-sponsored-result"/g) || []).length;
    
    if (sponsoredCount >= 8) return 'high';
    if (sponsoredCount >= 4) return 'medium';
    if (sponsoredCount >= 1) return 'low';
    return 'very_low';
  } catch (error) {
    console.error('Error assessing competition:', error);
    return 'unknown';
  }
}