import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type, ...params } = await req.json()

    switch (type) {
      case 'get_proxy_configurations':
        return await getProxyConfigurations(supabaseClient, params)
      case 'upsert_proxy_configuration':
        return await upsertProxyConfiguration(supabaseClient, params)
      case 'update_proxy_test_result':
        return await updateProxyTestResult(supabaseClient, params)
      case 'get_data_usage_settings':
        return await getDataUsageSettings(supabaseClient, params)
      case 'upsert_data_usage_settings':
        return await upsertDataUsageSettings(supabaseClient, params)
      case 'get_data_usage_stats':
        return await getDataUsageStats(supabaseClient, params)
      default:
        throw new Error('Invalid function type')
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function getProxyConfigurations(supabaseClient: any, { p_user_id }: { p_user_id: string }) {
  const { data, error } = await supabaseClient
    .from('proxy_configurations')
    .select('*')
    .eq('user_id', p_user_id)

  if (error) throw error

  return new Response(
    JSON.stringify({ data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

async function upsertProxyConfiguration(supabaseClient: any, { p_user_id, p_provider_id, p_configuration }: {
  p_user_id: string,
  p_provider_id: string,
  p_configuration: any
}) {
  const { data, error } = await supabaseClient
    .from('proxy_configurations')
    .upsert({
      user_id: p_user_id,
      provider_id: p_provider_id,
      configuration: p_configuration,
      updated_at: new Date().toISOString(),
    })

  if (error) throw error

  return new Response(
    JSON.stringify({ data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

async function updateProxyTestResult(supabaseClient: any, { p_user_id, p_provider_id, p_test_result }: {
  p_user_id: string,
  p_provider_id: string,
  p_test_result: any
}) {
  const { data, error } = await supabaseClient
    .from('proxy_configurations')
    .update({
      last_test_result: p_test_result,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', p_user_id)
    .eq('provider_id', p_provider_id)

  if (error) throw error

  return new Response(
    JSON.stringify({ data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

async function getDataUsageSettings(supabaseClient: any, { p_user_id }: { p_user_id: string }) {
  const { data, error } = await supabaseClient
    .from('data_usage_settings')
    .select('*')
    .eq('user_id', p_user_id)

  if (error) throw error

  return new Response(
    JSON.stringify({ data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

async function upsertDataUsageSettings(supabaseClient: any, { p_user_id, p_settings }: {
  p_user_id: string,
  p_settings: any
}) {
  const { data, error } = await supabaseClient
    .from('data_usage_settings')
    .upsert({
      user_id: p_user_id,
      settings: p_settings,
      updated_at: new Date().toISOString(),
    })

  if (error) throw error

  return new Response(
    JSON.stringify({ data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

async function getDataUsageStats(supabaseClient: any, { p_user_id }: { p_user_id: string }) {
  // Calculate usage statistics from api_requests table
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const { data: requests, error } = await supabaseClient
    .from('api_requests')
    .select('created_at, data_used, marketplace')
    .eq('user_id', p_user_id)
    .gte('created_at', monthAgo.toISOString())

  if (error) throw error

  let todayUsage = 0
  let weekUsage = 0
  let monthUsage = 0
  const byProvider: any = {}

  requests?.forEach((req: any) => {
    const createdAt = new Date(req.created_at)
    const dataUsed = req.data_used || 0

    if (createdAt >= today) {
      todayUsage += dataUsed
    }
    if (createdAt >= weekAgo) {
      weekUsage += dataUsed
    }
    monthUsage += dataUsed

    const provider = req.marketplace || 'unknown'
    if (!byProvider[provider]) {
      byProvider[provider] = { usage: 0, requests: 0 }
    }
    byProvider[provider].usage += dataUsed
    byProvider[provider].requests += 1
  })

  const stats = {
    today_usage: todayUsage,
    week_usage: weekUsage,
    month_usage: monthUsage,
    total_usage: monthUsage,
    by_provider: byProvider,
  }

  return new Response(
    JSON.stringify({ data: [stats] }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}