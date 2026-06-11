const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const sendMail = require('../services/mailService');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const planToPriceId = {
  monthly: process.env.STRIPE_PRICE_MONTHLY_ID,
  '3-month': process.env.STRIPE_PRICE_3MONTH_ID,
  '6-month': process.env.STRIPE_PRICE_6MONTH_ID,
  yearly: process.env.STRIPE_PRICE_YEARLY_ID
};

const planToAmount = {
  monthly: 699,
  '3-month': 1699,
  '6-month': 2999,
  yearly: 4199
};

// Create a Stripe Checkout session for the selected plan
const createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan || (!planToPriceId[plan] && !planToAmount[plan])) {
      return res.status(400).json({ message: 'Invalid or unsupported plan for checkout' });
    }

    const priceId = planToPriceId[plan];
    const amount = planToAmount[plan];

    const lineItem = priceId
      ? { price: priceId, quantity: 1 }
      : {
          price_data: {
            currency: 'usd',
            product_data: { name: `${plan} subscription plan` },
            unit_amount: amount
          },
          quantity: 1
        };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [lineItem],
      metadata: { plan },
      customer_email: req.user.email,
      success_url: `${CLIENT_URL}/subscription?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/subscription?canceled=1`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe createCheckoutSession error:', error.message || error);
    res.status(500).json({ message: error.message || 'Stripe checkout session creation failed' });
  }
};

// Confirm the checkout session and set the user's plan if paid
const confirmCheckout = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: 'Missing sessionId' });

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['payment_intent'] });
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const plan = session.metadata?.plan;
    if (!plan) return res.status(400).json({ message: 'Plan not found in session metadata' });

    const now = Date.now();
    let expiry = null;
    switch (plan) {
      case 'monthly': expiry = new Date(now + 30 * 24 * 60 * 60 * 1000); break;
      case '3-month': expiry = new Date(now + 90 * 24 * 60 * 60 * 1000); break;
      case '6-month': expiry = new Date(now + 180 * 24 * 60 * 60 * 1000); break;
      case 'yearly': expiry = new Date(now + 365 * 24 * 60 * 60 * 1000); break;
      default: expiry = null;
    }

const updated = await User.findByIdAndUpdate(
  req.user._id,
  {
    plan,
    planStart: new Date(now),
    planExpiry: expiry
  },
  { returnDocument: 'after' }
);
    // Send subscription confirmation email
try {
  const planNames = {
    monthly: 'Monthly Plan',
    '3-month': '3 Month Plan',
    '6-month': '6 Month Plan',
    yearly: 'Yearly Plan'
  };

  const durationText = {
    monthly: '30 Days',
    '3-month': '90 Days',
    '6-month': '180 Days',
    yearly: '365 Days'
  };

  await sendMail({
    to: updated.email,
    subject: '🎉 Subscription Activated Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto;">
        <h2>🎉 Subscription Activated!</h2>

        <p>Hello <b>${updated.name}</b>,</p>

        <p>Thank you for purchasing a subscription plan.</p>

        <p>Your plan has been activated successfully.</p>

        <table style="border-collapse: collapse;">
          <tr>
            <td><b>Plan:</b></td>
            <td>${planNames[plan]}</td>
          </tr>
          <tr>
            <td><b>Duration:</b></td>
            <td>${durationText[plan]}</td>
          </tr>
          <tr>
            <td><b>Valid Till:</b></td>
            <td>${new Date(expiry).toDateString()}</td>
          </tr>
        </table>

        <br>

        <h3>🔓 Premium Features Unlocked</h3>

        <ul>
          <li>Unlimited Trip Planning</li>
          <li>AI Trip Suggestions</li>
          <li>Hotel Recommendations</li>
          <li>Advanced Itinerary Features</li>
          <li>Premium Dashboard Access</li>
        </ul>

        <p>
          Your premium access is active until
          <b>${new Date(expiry).toDateString()}</b>.
        </p>

        <br>

        <p>Thank you for choosing Travel Planner ❤️</p>

        <p>
          Regards,<br>
          Travel Planner Team
        </p>
      </div>
    `
  });

} catch (mailError) {
  console.error('Email sending failed:', mailError);
}

    return res.json({ plan: updated.plan, planExpiry: updated.planExpiry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCheckoutSession, confirmCheckout };
