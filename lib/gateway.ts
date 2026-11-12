// J.A.X. OMNIVERSE — AI Gateway Client Library v2
// Frontend client for communicating with the JAX Gateway Edge Function

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nbjjfvzrjctsyixnhjzf.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

interface GatewayRequest {
  provider: string
  payload: Record<string, any>
  user_id?: string
}

interface GatewayResponse {
  success: boolean
  provider?: string
  type?: string
  duration_ms?: number
  content?: string
  input_tokens?: number
  output_tokens?: number
  data?: any
  raw?: any
  error?: string
  needs_key?: boolean
}

export async function callGateway(request: GatewayRequest): Promise<GatewayResponse> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/jax-gateway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(request),
    })
    return await response.json()
  } catch (error: any) {
    return { success: false, error: error.message || 'Gateway request failed' }
  }
}

export async function checkProviderHealth() {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/jax-health-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({}),
    })
    return await response.json()
  } catch (error: any) {
    return { success: false, summary: { total: 0, operational: 0, degraded: 0, offline: 0, not_configured: 0 }, providers: [] }
  }
}

// === AI PROVIDER HELPERS ===

export async function askAI(provider: string, messages: Array<{role: string, content: string}>, options?: {
  model?: string; system?: string; max_tokens?: number; temperature?: number
}) {
  return callGateway({
    provider,
    payload: { messages, model: options?.model, system: options?.system, max_tokens: options?.max_tokens, temperature: options?.temperature },
  })
}

export async function multiAICouncil(
  messages: Array<{role: string, content: string}>,
  options?: { system?: string; providers?: string[]; max_tokens?: number }
) {
  const providerList = options?.providers || ['deepseek', 'gemini']
  const promises = providerList.map(provider =>
    askAI(provider, messages, { system: options?.system, max_tokens: options?.max_tokens })
  )
  const results = await Promise.allSettled(promises)
  const responses = results.map((result, i) => ({
    provider: providerList[i],
    success: result.status === 'fulfilled' ? result.value.success : false,
    content: result.status === 'fulfilled' ? result.value.content : null,
    duration_ms: result.status === 'fulfilled' ? result.value.duration_ms : null,
    tokens: result.status === 'fulfilled' ? { input: result.value.input_tokens || 0, output: result.value.output_tokens || 0 } : null,
    error: result.status === 'rejected' ? result.reason?.message : result.value.error || null,
  }))
  return { council_results: responses, responded: responses.filter(r => r.success).length, failed: responses.filter(r => !r.success).length }
}

// === FRED HELPERS (Economic Data) ===

export async function getFREDEconomy(seriesId: string, options?: { start?: string; end?: string; limit?: number }) {
  return callGateway({
    provider: 'fred',
    payload: { series_id: seriesId, observation_start: options?.start, observation_end: options?.end, limit: options?.limit || 100, sort_order: 'desc' },
  })
}

export async function getGDP() { return getFREDEconomy('GDP') }
export async function getCPI() { return getFREDEconomy('CPIAUCSL') }
export async function getUnemployment() { return getFREDEconomy('UNRATE') }
export async function getFedFundsRate() { return getFREDEconomy('DFF') }
export async function getTreasuryYields() { return getFREDEconomy('DGS10') }

// === FMP HELPERS (Market Data) ===

export async function getFMPQuote(symbol: string) {
  return callGateway({ provider: 'fmp', payload: { endpoint: 'stock_quote', symbol } })
}

export async function getFMPFinancials(symbol: string, type: 'income_statement' | 'balance_sheet' | 'cash_flow' = 'income_statement', period: 'annual' | 'quarter' = 'annual') {
  return callGateway({ provider: 'fmp', payload: { endpoint: type, symbol, period, limit: 4 } })
}

export async function getFMPHistoricalPrices(symbol: string) {
  return callGateway({ provider: 'fmp', payload: { endpoint: 'historical_prices', symbol } })
}

export async function getFMPForexRates() {
  return callGateway({ provider: 'fmp', payload: { endpoint: 'forex_rates' } })
}

export async function getFMPCryptoPrices() {
  return callGateway({ provider: 'fmp', payload: { endpoint: 'crypto_prices' } })
}

export async function getFMPEarningsCalendar() {
  return callGateway({ provider: 'fmp', payload: { endpoint: 'earnings_calendar' } })
}

// === ALPHA VANTAGE HELPERS ===

export async function getAVTimeSeries(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min') {
  return callGateway({ provider: 'alpha_vantage', payload: { function_name: 'time_series', symbol, interval } })
}

export async function getAVForexRate(fromCurrency: string, toCurrency: string) {
  return callGateway({ provider: 'alpha_vantage', payload: { function_name: 'forex_exchange', from_currency: fromCurrency, to_currency: toCurrency } })
}

export async function getAVCryptoRate(fromCurrency: string, toCurrency: string = 'USD') {
  return callGateway({ provider: 'alpha_vantage', payload: { function_name: 'crypto_exchange', from_currency: fromCurrency, to_currency: toCurrency } })
}

export async function getAVTechnicalIndicators(symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily') {
  return callGateway({ provider: 'alpha_vantage', payload: { function_name: 'technical_indicators', symbol, interval } })
}

export async function getAVNewsSentiment(symbol: string) {
  return callGateway({ provider: 'alpha_vantage', payload: { function_name: 'news_sentiment', symbol } })
}

export async function getAVEconomicIndicators() {
  return callGateway({ provider: 'alpha_vantage', payload: { function_name: 'economic_indicators' } })
}

// ═══════════════════════════════════════════════════════════════
// SMART ROUTER — Intelligent task routing with fallback chains
// ═══════════════════════════════════════════════════════════════

interface RouterRequest {
  task_type?: string
  messages: { role: string; content: string }[]
  system?: string
  strategy?: 'cost' | 'speed' | 'balanced' | 'quality'
  override_provider?: string
}

interface RouterResponse {
  success: boolean
  provider?: string
  model?: string
  content?: string
  input_tokens?: number
  output_tokens?: number
  duration_ms?: number
  routing?: {
    strategy: string
    task_type: string
    attempts: number
    fallback_used: boolean
  }
  error?: string
}

export async function smartRoute(request: RouterRequest): Promise<RouterResponse> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-router`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    return await res.json()
  } catch (error: any) {
    return { success: false, error: error.message || 'Router connection failed' }
  }
}

// ═══════════════════════════════════════════════════════════════
// MULTI-AI COUNCIL — Parallel analysis with contradiction detection
// ═══════════════════════════════════════════════════════════════

interface CouncilRequest {
  topic: string
  providers?: string[]
  messages?: { role: string; content: string }[]
  task_type?: string
}

interface CouncilResponse {
  success: boolean
  session_id?: string
  providers_consulted?: string[]
  responses?: Array<{
    provider: string
    status: string
    model: string
    duration_ms: number
    tokens: { input: number; output: number }
  }>
  consensus_level?: string
  contradictions?: any[]
  consolidated_report?: string
  total_tokens?: number
  total_duration_ms?: number
  error?: string
}

export async function conveneCouncil(request: CouncilRequest): Promise<CouncilResponse> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-council`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    return await res.json()
  } catch (error: any) {
    return { success: false, error: error.message || 'Council connection failed' }
  }
}

// ═══════════════════════════════════════════════════════════════
// USAGE ANALYTICS — Token tracking and cost analysis
// ═══════════════════════════════════════════════════════════════

interface UsageResponse {
  success: boolean
  period?: string
  summary?: {
    total_requests: number
    successful_requests: number
    failed_requests: number
    total_tokens: number
    input_tokens: number
    output_tokens: number
    estimated_cost_usd: number
    avg_duration_ms: number
  }
  recent_requests?: any[]
  error?: string
}

export async function getUsageAnalytics(period: 'today' | 'week' | 'month' | 'all' = 'week'): Promise<UsageResponse> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/jax-usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period }),
    })
    return await res.json()
  } catch (error: any) {
    return { success: false, error: error.message || 'Usage service connection failed' }
  }
}
