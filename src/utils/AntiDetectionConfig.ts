// Anti-detection configuration and utilities
export interface AntiDetectionConfig {
  userAgents: string[];
  requestDelayRange: { min: number; max: number };
  maxRetries: number;
  captchaDetectionPatterns: string[];
  sessionRotationInterval: number;
}

export const ANTI_DETECTION_CONFIG: AntiDetectionConfig = {
  userAgents: [
    // Chrome on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    
    // Chrome on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    
    // Firefox on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    
    // Safari on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    
    // Edge on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    
    // Mobile browsers
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
  ],
  
  requestDelayRange: {
    min: 2000, // 2 seconds
    max: 8000  // 8 seconds
  },
  
  maxRetries: 3,
  
  captchaDetectionPatterns: [
    'captcha',
    'robot',
    'automation',
    'suspicious activity',
    'verify you are human',
    'security check',
    'prove you\'re not a robot',
    'unusual traffic'
  ],
  
  sessionRotationInterval: 300000 // 5 minutes
};

export class AntiDetectionUtils {
  private static lastRequestTime = 0;
  private static sessionStartTime = Date.now();
  
  static getRandomUserAgent(): string {
    const { userAgents } = ANTI_DETECTION_CONFIG;
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }
  
  static async getRandomDelay(): Promise<number> {
    const { min, max } = ANTI_DETECTION_CONFIG.requestDelayRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  static async waitRandomDelay(): Promise<void> {
    const delay = await this.getRandomDelay();
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    
    if (timeSinceLastRequest < delay) {
      await new Promise(resolve => setTimeout(resolve, delay - timeSinceLastRequest));
    }
    
    this.lastRequestTime = Date.now();
  }
  
  static needsSessionRotation(): boolean {
    const timeSinceSession = Date.now() - this.sessionStartTime;
    return timeSinceSession > ANTI_DETECTION_CONFIG.sessionRotationInterval;
  }
  
  static resetSession(): void {
    this.sessionStartTime = Date.now();
  }
  
  static detectCaptcha(html: string): boolean {
    const lowerHtml = html.toLowerCase();
    return ANTI_DETECTION_CONFIG.captchaDetectionPatterns.some(pattern => 
      lowerHtml.includes(pattern.toLowerCase())
    );
  }
  
  static generateRealisticHeaders(userAgent: string): Record<string, string> {
    return {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Connection': 'keep-alive'
    };
  }
  
  static async makeRequestWithRetry(
    url: string, 
    options: RequestInit = {},
    maxRetries: number = ANTI_DETECTION_CONFIG.maxRetries
  ): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Wait between requests
        if (attempt > 0) {
          await this.waitRandomDelay();
        }
        
        // Generate new headers for each attempt
        const userAgent = this.getRandomUserAgent();
        const headers = {
          ...this.generateRealisticHeaders(userAgent),
          ...options.headers
        };
        
        const response = await fetch(url, {
          ...options,
          headers
        });
        
        // Check for CAPTCHA or blocking
        if (response.status === 503 || response.status === 403) {
          const text = await response.text();
          if (this.detectCaptcha(text)) {
            throw new Error('CAPTCHA detected');
          }
        }
        
        if (response.ok) {
          return response;
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        
      } catch (error) {
        lastError = error as Error;
        
        console.log(`Attempt ${attempt + 1} failed:`, error);
        
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
}