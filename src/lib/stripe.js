import { loadStripe } from '@stripe/stripe-js'

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

let stripePromise = null

export function getStripe() {
  if (!stripePromise && stripeKey) {
    stripePromise = loadStripe(stripeKey)
  }
  return stripePromise
}
