const express = require("express");
const { connectDB } = require("../src/config/database")
const { User } = require("./models/user")
const app = express();

app.use(express.json())

app.post("/signup", async (req, res) => {
    try {
        const userData = req.body
        console.log(userData)
        const user = new User(userData)
        await user.save()
        res.send("User saved succesfully")
    } catch (error) {
        console.log("Error :", error.message)
        res.status(400).send("Bad request")
    }
})

app.get("/users", async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (error) {
        console.log("Error :", error.message)
        res.status(400).send("Something went wrong")
    }
})

app.get("/user/:userId", async (req, res) => {

    try {
        const userId = req.params.userId;
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).send("User not found")
        }

        res.send(user)
    } catch (error) {
        console.log("Error :", error.message)
        res.status(400).send("Something went wrong")
    }
})


app.get("/userByEmail", async (req, res) => {
    const emailId = req.query.emailId;
    try {
        const user = await User.findOne({ emailId: emailId })
        if (!user) {
            return res.status(404).send("User not found")
        }

        res.send(user)
    } catch (error) {
        console.log("Error :", error.message)
        res.status(400).send("Something went wrong")
    }
})


app.patch("/user", async (req, res) => {
    const userData = req.body
    const userId = req.body.userId
    try {
        const user = await User.findByIdAndUpdate(userId, userData, { returnDocument: "after" })
        if (!user) {
            return res.status(404).send("User not found")
        }
        res.send("User Updated succesfully")
    } catch (error) {
        console.log("Error :", error.message)
        res.status(400).send("Bad request")
    }
})


app.patch("/userByEmail", async (req, res) => {
    const userEmail = req.body.emailId
    const userData = req.body
    try {
        const user = await User.findOneAndUpdate({emailId : userEmail}, userData, { new: "true" })
        if (!user) {
            return res.status(404).send("User not found")
        }
        res.send("User Updated successfully")
    } catch (error) {
        console.log("Error :", error.message)
        res.status(400).send("Bad request")
    }
})

app.delete("/user", async (req, res) => {
    const userId = req.body.userId
    try {
        const user = await User.findByIdAndDelete(userId)
        res.send("User Deleted successfully")
    } catch (error) {
        console.log("Error :", error.message)
        res.status(400).send("Bad request")
    }
})

connectDB()
    .then(() => {
        console.log("Database connection established");
        app.listen(3000, () => {
            console.log("Serever is listening on 3000");
        });
    })
    .catch((err) => {
        console.error("Something went wrong: ", err.message);
    });
