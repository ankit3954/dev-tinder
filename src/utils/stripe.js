const { membershipAmount } = require("../utils/constants");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const YOUR_DOMAIN = process.env.FRONTEND_URL;


const createStripeCheckoutSession = async (
    membershipType,
    firstName,
    lastName,
    emailId
) => {

    const amountInPaise = membershipAmount[membershipType] * 100;
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: membershipType,
                    },
                    unit_amount: amountInPaise,  // Amount in paise
                },
                quantity: 1
            },
        ],
        metadata: {
            firstName,
            lastName,
            emailId,
            membershipType
        },
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/premium`,
        cancel_url: `${YOUR_DOMAIN}/premium`,
    });

    return session

}

module.exports = {
    createStripeCheckoutSession,
}