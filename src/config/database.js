const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose")

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB)
}

module.exports = {
    connectDB
}