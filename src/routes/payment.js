const express = require("express")
const paymentRouter = express.Router();
const { userAuth } = require("../middlewares/auth")
const Payment = require("../models/payment");
const { User } = require("../models/user");
const { createStripeCheckoutSession } = require("../utils/stripe")

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
paymentRouter.post("/payment/create", express.json(), userAuth, async (req, res) => {
    try {
        const { membershipType } = req.body;
        const { firstName, lastName, emailId } = req.user;

        const session = await createStripeCheckoutSession(membershipType, firstName, lastName, emailId)

        const payment = new Payment({
            userId: req.user._id,
            orderId: session.id,
            status: session.status,
            amount: session.amount_total,
            currency: session.currency,
            notes: session.metadata,
        });


        const savedPayment = await payment.save();

        res.json({ ...savedPayment.toJSON(), url: session.url })

    } catch (error) {
        console.error(error)
        res.status(400).send("ERROR : " + error.message);
    }

})

paymentRouter.post("/payment/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    try {
        const sig = req.headers["stripe-signature"].toString();

        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );


        // Ignore all other events
        if (event.type !== "checkout.session.completed") {
            return res.status(200).send();
        }

        const session = event.data.object;

        const orderId = session.id;
        const paymentStatus = session.status;

        const payment = await Payment.findOne({ orderId });

        if (!payment) {
            return res.status(200).send();
        }

        payment.status = paymentStatus;
        await payment.save();

        const user = await User.findOne(payment.userId);

        if (user) {
            user.isPremium = true;
            user.membershipType = payment.notes.membershipType;
            await user.save();
        }

        return res.status(200).send();

    } catch (error) {
        console.error("Webhook error:", error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }
}
);


paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
    const user = req.user.toJSON();
    if (user.isPremium) {
        
        return res.json({ ...user });
    }
    return res.json({ ...user });
});

module.exports = paymentRouter;