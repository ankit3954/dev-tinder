const express = require("express");
const { connectDB } = require("../src/config/database")
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors")
const http = require("http")

require('dotenv').config({ path: "./src/.env" });
require("./utils/cronJobs")

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chat");
const intializeSocket = require("./utils/socket");

const server = http.createServer(app);
intializeSocket(server)

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(cookieParser());
app.use("/", paymentRouter);

app.use(express.json())

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);


connectDB()
    .then(() => {
        console.log("Database connection established");
        server.listen(process.env.PORT, () => {
            console.log("Server is listening on 3000");
        });
    })
    .catch((err) => {
        console.error("Something went wrong: ", err.message);
    });
