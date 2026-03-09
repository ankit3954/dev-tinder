const express = require("express");
const authRouter = express.Router();

const { validateSignUpData } = require("../utils/validation");
const { User } = require("../models/user");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    //   Creating a new instance of the User model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();
    const token = await user.getJWT();

    res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
    
      
    delete savedUser.toObject().password;

    // const { , ...userWithoutPassword } = savedUser.toObject()
    res.status(200).json({
      message: "User Added Successfully",
      data: savedUser
    });
  } catch (err) {
    console.error(err)
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });

      const { password, ...userWithoutPassword } = user.toObject()
      res.status(200).json({
        message: "Login Successfull",
        data: userWithoutPassword
      });
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});


authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout Successful!!");
});

module.exports = authRouter;
