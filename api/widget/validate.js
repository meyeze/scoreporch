// Vercel serverless function — validates an embed ID and returns the user's tier
// Called by the widget JS before (or during) data fetching
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // CORS for widget requests from any domain
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { embedId } = req.query
  if (!embedId) {
    return res.status(400).json({ error: 'Missing embedId' })
  }

  try {
    // Look up the embed config
    const { data: embed, error: embedErr } = await supabase
      .from('embeds')
      .select('id, user_id, team_id, modules, branding')
      .eq('id', embedId)
      .single()

    if (embedErr || !embed) {
      return res.status(404).json({ error: 'Invalid embed ID' })
    }

    // Check the user's subscription tier
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', embed.user_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const tier = sub?.tier || 'free'

    // Free users can't use embeds
    if (tier === 'free') {
      return res.status(403).json({ error: 'Embed widget requires a Premium or Pro subscription', upgrade: true })
    }

    // White-label (no branding) is Pro only
    const branding = tier === 'pro' ? embed.branding : true

    return res.status(200).json({
      valid: true,
      embedId: embed.id,
      teamId: embed.team_id,
      modules: embed.modules,
      branding,
      tier,
    })
  } catch (err) {
    console.error('[Widget Validate]', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
