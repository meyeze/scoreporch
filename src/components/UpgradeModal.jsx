import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import './UpgradeModal.css'

const PLANS = [
  {
    tier: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['1 team', 'Live scores', 'Box scores', 'Standings'],
    cta: 'Current Plan',
    highlighted: false,
  },
  {
    tier: 'premium',
    name: 'Premium',
    price: '$4',
    period: '/mo',
    features: ['Up to 5 teams', 'Live scores', 'Box scores', 'Standings', 'Game countdown', 'Team news feed'],
    cta: 'Upgrade',
    highlighted: true,
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: '$8',
    period: '/mo',
    features: ['All 30 teams', 'Everything in Premium', 'Priority support', 'Early access to new features'],
    cta: 'Go Pro',
    highlighted: false,
  },
]

export default function UpgradeModal({ onClose }) {
  const { user, tier: currentTier } = useAuth()
  const [loading, setLoading] = useState(null)

  const handleUpgrade = async (tier) => {
    if (tier === 'free' || tier === currentTier) return
    setLoading(tier)

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          userId: user.id,
          email: user.email,
        }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Checkout error:', data.error)
      }
    } catch (err) {
      console.error('Upgrade error:', err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="upgrade-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <button className="upgrade-close" onClick={onClose}>&times;</button>
        <h2 className="upgrade-heading">Choose Your Plan</h2>
        <p className="upgrade-subtext">One team is free, forever. Want more? Upgrade anytime.</p>

        <div className="upgrade-plans">
          {PLANS.map((plan) => {
            const isCurrent = plan.tier === currentTier
            return (
              <div
                key={plan.tier}
                className={`upgrade-plan ${plan.highlighted ? 'upgrade-plan--highlighted' : ''} ${isCurrent ? 'upgrade-plan--current' : ''}`}
              >
                <div className="upgrade-plan-header">
                  <span className="upgrade-plan-name">{plan.name}</span>
                  <div className="upgrade-plan-price">
                    <span className="upgrade-plan-amount">{plan.price}</span>
                    <span className="upgrade-plan-period">{plan.period}</span>
                  </div>
                </div>
                <ul className="upgrade-plan-features">
                  {plan.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <button
                  className={`upgrade-plan-cta ${isCurrent ? 'upgrade-plan-cta--current' : ''}`}
                  onClick={() => handleUpgrade(plan.tier)}
                  disabled={isCurrent || loading === plan.tier}
                >
                  {loading === plan.tier ? 'Loading...' : isCurrent ? 'Current Plan' : plan.cta}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
