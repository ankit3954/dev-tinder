const express = require("express");
const { connectDB } = require("../src/config/database")
const { User } = require("./models/user")
const app = express();

app.use(express.json())

app.post("/signup", async (req, res) => {
    try {
        const userData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailId: req.body.emailId,
            password: req.body.password,
            age: req.body.age,
            gender: req.body.gender
        }
        console.log(userData)
        const user = new User(userData)
        await user.save()
        res.send("User saved succesfully")
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
