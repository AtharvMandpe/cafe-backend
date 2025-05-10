import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app=express();

app.use(cors({
    origin:process.env.ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("../public"))
app.use(cookieParser())

//User Router

import tableRouter from "./routes/table.route.js"
app.use("/api/table",tableRouter)

//Payment Router
import paymentRouter from "./routes/payment.route.js"
app.use("/api/payment",paymentRouter)

//Menu Router
import menuRouter from "./routes/menu.route.js"
app.use("/api/menu",menuRouter)

//Waiter Router
import waiterRouter from "./routes/waiter.route.js"
app.use("/api/waiter",waiterRouter)

export default app;



