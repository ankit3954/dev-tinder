const express = require("express");
const { connectDB } = require("../src/config/database")
const { User } = require("./models/user")
const app = express();
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

app.use(express.json())
app.use(cookieParser());

app.post("/signup", async (req, res) => {
   try {
    // Validation of data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    //   Creating a new instance of the User model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    await user.save();
    res.send("User Added successfully!");
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
})


app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    console.log(user)
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send("Login Successful!!!");
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  // Sending a connection request
  console.log("Sending a connection request");

  res.send(user.firstName + "sent the connect request!");
});


// app.get("/users", async (req, res) => {
//     try {
//         const users = await User.find({})
//         res.send(users)
//     } catch (error) {
//         console.log("Error :", error.message)
//         res.status(400).send("Something went wrong")
//     }
// })

// app.get("/user/:userId", async (req, res) => {

//     try {
//         const userId = req.params.userId;
//         const user = await User.findById(userId)
//         if (!user) {
//             return res.status(404).send("User not found")
//         }

//         res.send(user)
//     } catch (error) {
//         console.log("Error :", error.message)
//         res.status(400).send("Something went wrong")
//     }
// })


// app.get("/userByEmail", async (req, res) => {
//     const emailId = req.query.emailId;
//     try {
//         const user = await User.findOne({ emailId: emailId })
//         if (!user) {
//             return res.status(404).send("User not found")
//         }

//         res.send(user)
//     } catch (error) {
//         console.log("Error :", error.message)
//         res.status(400).send("Something went wrong")
//     }
// })


// app.patch("/user/:userId", async (req, res) => {
//     console.log(req.params.userId, req.body)
//     try {
//         const userId = req.params?.userId;
//         const data = req.body;
//         const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];
//         const isUpdateAllowed = Object.keys(data).every((k) =>
//             ALLOWED_UPDATES.includes(k)
//         );
//         if (!isUpdateAllowed) {
//             throw new Error("Update not allowed");
//         }
//         if (data?.skills?.length > 10) {
//             throw new Error("Skills cannot be more than 10");
//         }
//         const user = await User.findByIdAndUpdate(userId, data, {
//             returnDocument: "after",
//             runValidators: true,
//         });
//         if(!user){
//             throw new Error("User not Found")
//         }
//         console.log(user);
//         res.send("User updated successfully");
//     } catch (err) {
//         res.status(400).send("UPDATE FAILED:" + err.message);
//     }
// }
// )


// app.patch("/userByEmail", async (req, res) => {
//     const userEmail = req.body.emailId
//     const userData = req.body
//     try {
//         const user = await User.findOneAndUpdate({ emailId: userEmail }, userData, { new: "true" })
//         if (!user) {
//             return res.status(404).send("User not found")
//         }
//         res.send("User Updated successfully")
//     } catch (error) {
//         console.log("Error :", error.message)
//         res.status(400).send("Bad request")
//     }
// })

// app.delete("/user", async (req, res) => {
//     const userId = req.body.userId
//     try {
//         const user = await User.findByIdAndDelete(userId)
//         res.send("User Deleted successfully")
//     } catch (error) {
//         console.log("Error :", error.message)
//         res.status(400).send("Bad request")
//     }
// })

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
