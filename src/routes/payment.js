const express = require("express")
const paymentRouter = express.Router();
const { userAuth } = require("../middlewares/auth")
const Payment = require("../models/payment");
const {createStripeCheckoutSession} = require("../utils/stripe")


paymentRouter.post("/payment/create", userAuth, async (req, res) => {
    try {
        const { membershipType } = req.body;
        const { firstName, lastName, emailId } = req.user;

        // const { movieName, amount, quantity, bookingId } = req.body;
        const session = await createStripeCheckoutSession(membershipType, firstName, lastName, emailId)
        // console.log(session)

        const payment = new Payment({
            userId: req.user._id,
            orderId: session.id,
            status: session.status,
            amount: session.amount_total,
            currency: session.currency,
            // receipt: order.receipt,
            notes: session.metadata,
        });


           const savedPayment = await payment.save();

            res.json({ ...savedPayment.toJSON(), url: session.url })

        // sendResponse(true, res, 201, { url: session.url }, "Checkout Session Created")
    } catch (error) {
        console.error(error)
        res.status(400).send("ERROR : " + error.message);
    }

})

module.exports = paymentRouter;