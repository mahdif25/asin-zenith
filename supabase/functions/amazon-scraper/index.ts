import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Anti-detection configuration
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
];

const CAPTCHA_PATTERNS = [
  'captcha', 'robot', 'automation', 'suspicious activity', 
  'verify you are human', 'security check', 'prove you\'re not a robot'
];

// Session management and proxy rotation
let sessionCookies: string = '';
let lastSessionUpdate = 0;
let currentProxyIndex = 0;
let proxyPool: any[] = [];
const SESSION_TIMEOUT = 300000; // 5 minutes

// Request data structure
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

// Anti-detection utilities
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function getRandomDelay(): number {
  return Math.floor(Math.random() * 6000) + 2000; // 2-8 seconds
}

function detectCaptcha(html: string): boolean {
  const lowerHtml = html.toLowerCase();
  return CAPTCHA_PATTERNS.some(pattern => lowerHtml.includes(pattern));
}

function generateRealisticHeaders(userAgent: string): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Connection': 'keep-alive',
  };
  
  // Add session cookies if available
  if (sessionCookies) {
    headers['Cookie'] = sessionCookies;
  }
  
  return headers;
}

async function makeRequestWithRetry(url: string, maxRetries: number = 3): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Random delay between requests
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
      }
      
      const userAgent = getRandomUserAgent();
      const headers = generateRealisticHeaders(userAgent);
      
      // Try with proxy if available
      const proxy = getNextProxy();
      if (proxy) {
        console.log(`Attempt ${attempt + 1} with proxy ${proxy.id} - Fetching: ${url}`);
        headers['Proxy-Authorization'] = generateProxyAuth(proxy);
      } else {
        console.log(`Attempt ${attempt + 1} direct - Fetching: ${url}`);
      }
      
      console.log(`User-Agent: ${userAgent}`);
      
      const fetchOptions: RequestInit = {
        method: 'GET',
        headers,
        redirect: 'follow'
      };

      // Add proxy configuration if available
      if (proxy) {
        // Note: In Deno, proxy support requires using a proxy client
        // For now, we'll implement basic proxy headers
        fetchOptions.headers = {
          ...headers,
          'Host': new URL(url).host,
        };
      }
      
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Check for CAPTCHA or blocking
      if (detectCaptcha(html)) {
        throw new Error('CAPTCHA detected - rotating session and proxy');
      }
      
      // Update session cookies
      const setCookieHeaders = response.headers.get('set-cookie');
      if (setCookieHeaders) {
        sessionCookies = setCookieHeaders;
        lastSessionUpdate = Date.now();
      }
      
      console.log(`Request successful - Content length: ${html.length}`);
      return html;
      
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error.message);
      
      // On CAPTCHA or blocking, rotate proxy immediately
      if (error.message.includes('CAPTCHA') || error.message.includes('403') || error.message.includes('503')) {
        rotateSession();
        console.log('Rotating proxy due to blocking');
      }
      
      // Exponential backoff with jitter
      if (attempt < maxRetries - 1) {
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt), 10000);
        const jitter = Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffDelay + jitter));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

function shouldRotateSession(): boolean {
  return Date.now() - lastSessionUpdate > SESSION_TIMEOUT;
}

function rotateSession(): void {
  sessionCookies = '';
  lastSessionUpdate = 0;
  console.log('Session rotated');
}

// Proxy management functions
async function loadProxyPool(supabase: any, userId?: string): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('proxy-helper-functions', {
      body: { type: 'get_proxy_configurations', p_user_id: userId }
    });

    if (error) throw error;

    proxyPool = (data?.data || [])
      .filter((config: any) => config.configuration?.enabled && config.configuration?.endpoint)
      .map((config: any) => ({
        id: config.provider_id,
        endpoint: config.configuration.endpoint,
        port: config.configuration.port,
        username: config.configuration.username,
        password: config.configuration.password,
        zones: config.configuration.zones?.split(',') || ['US']
      }));

    console.log(`Loaded ${proxyPool.length} active proxies`);
  } catch (error) {
    console.error('Error loading proxy pool:', error);
    proxyPool = [];
  }
}

function getNextProxy(): any | null {
  if (proxyPool.length === 0) return null;
  
  currentProxyIndex = (currentProxyIndex + 1) % proxyPool.length;
  return proxyPool[currentProxyIndex];
}

function generateProxyAuth(proxy: any): string {
  if (!proxy.username || !proxy.password) return '';
  return `Basic ${btoa(`${proxy.username}:${proxy.password}`)}`;
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

    const { asin, keywords, marketplace, trackingJobId, userId }: ScrapeRequest & { userId?: string } = await req.json();
    
    console.log(`Processing scrape request for ASIN: ${asin}, Keywords: ${keywords.join(', ')}`);
    
    // Load proxy configurations for this user
    await loadProxyPool(supabase, userId);
    
    // Check if session rotation is needed
    if (shouldRotateSession()) {
      rotateSession();
    }
    
    const results: ScrapingResult[] = [];
    
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
    
    for (const keyword of keywords) {
      try {
        console.log(`Scraping keyword: "${keyword}"`);
        
        // Build Amazon search URL
        const searchUrl = `${baseUrl}/s?k=${encodeURIComponent(keyword)}&ref=sr_pg_1`;
        
        // Random delay before each keyword search (2-8 seconds)
        const delay = getRandomDelay();
        console.log(`Waiting ${delay}ms before next request`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Make request with anti-detection measures
        const html = await makeRequestWithRetry(searchUrl);
        
        // Parse results
        const organicPosition = findProductPosition(html, asin, 'organic');
        const sponsoredPosition = findProductPosition(html, asin, 'sponsored');
        const searchVolume = estimateSearchVolume(html);
        const competitionLevel = assessCompetitionLevel(html);
        
        const result: ScrapingResult = {
          keyword,
          organicPosition,
          sponsoredPosition,
          searchVolume,
          competitionLevel
        };
        
        results.push(result);
        
        console.log(`Keyword "${keyword}" results:`, result);
        
        // Log successful scrape to database
        await supabase.from('api_requests').insert({
          tracking_job_id: trackingJobId,
          user_id: null, // Will be set by RLS
          keyword,
          marketplace,
          success: true,
          response_time_ms: Date.now(),
          ip_address: null,
          user_agent: getRandomUserAgent()
        });
        
      } catch (error) {
        console.error(`Error scraping keyword "${keyword}":`, error);
        
        // Log failed scrape to database
        await supabase.from('api_requests').insert({
          tracking_job_id: trackingJobId,
          user_id: null, // Will be set by RLS
          keyword,
          marketplace,
          success: false,
          error_message: error.message,
          response_time_ms: Date.now(),
          ip_address: null,
          user_agent: getRandomUserAgent()
        });
        
        // Add empty result for failed keyword
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