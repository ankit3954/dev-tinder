const cron = require("node-cron")
const { subDays, startOfDay, endOfDay } = require("date-fns")
const ConnectionRequestModel = require("../models/connectionRequest")
const sendEmail = require("./sesSendEmail")

cron.schedule("4 8 * * *", async () => {

    try {
        const yesterday = subDays(new Date(), 1)
        const yesterdayStart = startOfDay(yesterday)
        const yesterdayEnd = endOfDay(yesterday)

        const pendingRequests = await ConnectionRequestModel.find({
            status: "interested",
            createdAt: {
                $gte: yesterdayStart,
                $lte: yesterdayEnd
            }
        }).populate("fromUserId toUserId")

        const listOfEmails = [...new Set(pendingRequests.map((req) => req.toUserId.emailId))]

        for (const email of listOfEmails) {
            try {
                const res = await sendEmail.run(
                    `New Friend Request is pending from ${email}`,
                    "Please login in devzones.xyz for reviewing those requests"
                )
                console.log(res)
            } catch (error) {
                console.log(error)
            }
        }

    } catch (error) {
        console.log(error)
    }

})