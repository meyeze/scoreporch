// Vercel serverless function — creates a new embed configuration
// Called from the ScorePorch dashboard when user generates an embed code
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify the user from the Authorization header (Supabase JWT)
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const token = authHeader.replace('Bearer ', '')

  // Verify JWT and get user
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Admin override — these emails always get Pro access for testing
  const ADMIN_EMAILS = ['mize.nathan@gmail.com']
  const isAdmin = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())

  // Check subscription tier
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const tier = isAdmin ? 'pro' : (sub?.tier || 'free')
  if (tier === 'free') {
    return res.status(403).json({ error: 'Embed widget requires Premium or Pro subscription' })
  }

  const { teamId, modules, branding, label } = req.body || {}

  if (!teamId) {
    return res.status(400).json({ error: 'teamId is required' })
  }

  // Validate modules
  const validModules = ['scores', 'headlines', 'countdown', 'standings', 'boxscores']
  const selectedModules = (modules || ['scores', 'headlines', 'countdown', 'standings'])
    .filter(m => validModules.includes(m))

  // White-label only for Pro
  const showBranding = tier === 'pro' ? (branding !== false) : true

  try {
    const { data: embed, error } = await supabase
      .from('embeds')
      .insert({
        user_id: user.id,
        team_id: teamId,
        modules: selectedModules,
        branding: showBranding,
        label: label || null,
      })
      .select()
      .single()

    if (error) throw error

    return res.status(200).json({
      embed,
      snippet: generateSnippet(embed),
    })
  } catch (err) {
    console.error('[Widget Create]', err)
    return res.status(500).json({ error: 'Failed to create embed' })
  }
}

function generateSnippet(embed) {
  const modules = embed.modules.join(',')
  return `<script src="https://app.scoreporch.com/widget/scoreporch-widget.js" data-embed-id="${embed.id}" data-team="${embed.team_id}" data-modules="${modules}"${embed.branding === false ? ' data-branding="false"' : ''}></script>`
}
