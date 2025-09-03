import { serve } from "https://deno.land/std@0.208.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { provider, config } = await req.json()

    // Test the proxy connection
    const result = await testProxyConnection(provider, config)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'Connection test failed' 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function testProxyConnection(provider: string, config: any) {
  try {
    // Create proxy URL
    const proxyUrl = `http://${config.username}:${config.password}@${config.endpoint}:${config.port}`
    
    // Test with a simple HTTP request through the proxy
    const testUrl = 'https://httpbin.org/ip'
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.text()
      return {
        success: true,
        message: `Connection successful! Response received from ${provider}`,
        data: data
      }
    } else {
      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Connection timeout - proxy may be slow or unreachable'
      }
    }

    return {
      success: false,
      message: `Connection failed: ${error.message}`
    }
  }
}