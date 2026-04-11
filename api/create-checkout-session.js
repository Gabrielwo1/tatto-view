import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, email, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    // Standardizing line items for both Tattoos and Merch
    const line_items = items.map((item) => {
      const description = item.itemType === 'tattoo' 
        ? 'Reserva de design (Sinal)' 
        : `Produto - Tamanho: ${item.selectedSize || 'N/A'}`;

      return {
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.name,
            description: description,
            images: [item.image],
            metadata: {
              itemId: item.itemId,
              itemType: item.itemType,
              selectedSize: item.selectedSize || '',
            },
          },
          unit_amount: item.priceCents,
        },
        quantity: 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: email,
      success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/carrinho`,
      metadata: {
        userId,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
