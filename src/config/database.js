const mongoose = require("mongoose")

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://karnankit3954_db_user:W7968wTIemhOyid0@cluster0.hvskou9.mongodb.net/devTinder")
}

module.exports = {
    connectDB
}