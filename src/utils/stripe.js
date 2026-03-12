// import dotenv from "dotenv"
// import { updateBookingsStatus } from "../controllers/movies.controller"
// import { handlePaymentSuccess } from "../controllers/payment.controller"

// dotenv.config()
const { membershipAmount } = require("../utils/constants");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const YOUR_DOMAIN = 'http://localhost:5000'


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
        metadata:{
            firstName,
            lastName,
            emailId
        },
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/payment/success`,
        cancel_url: `${YOUR_DOMAIN}/payment/cancel`,
    });

    return session

}


const stripeWebhook = (body, sig) => {
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const userDetails = session.metadata;

        //updating booking status in db after confirming payment using webhook
        // if(bookingId){
        //     updateBookingsStatus(bookingId)
        //     // sendBookingConfirmationMail(bookingId)
        //     handlePaymentSuccess(bookingId)
        // }

        console.log(userDetails)
    }

}

module.exports = {
    createStripeCheckoutSession,
    stripeWebhook
}