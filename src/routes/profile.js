const express = require("express");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData, validateEditedPassword } = require("../utils/validation")

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfuly`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    validateEditedPassword(req)
    const loggedInUser = req.user;
    const isCurrentPasswordValid = await bcrypt.compare(
      req.body?.currentPassword,
      loggedInUser.password
    );

    if (!isCurrentPasswordValid) {
      throw new Error("Current password is invalid")
    }

    const newPassword = req.body?.password

    const passwordHash = await bcrypt.hash(newPassword, 10);
    loggedInUser["password"] = passwordHash

    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your password updated successfuly`,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports = profileRouter;