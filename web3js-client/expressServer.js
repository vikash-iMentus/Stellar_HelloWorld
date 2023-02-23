import express from "express";
import { setPayment } from "./paymentServer.js";
import { submitTrs } from "./submitTrx.js";
import { setHello } from "./helloServer.js";
import dotenv from "dotenv"
dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from express");
});

app.post("/hello", setHello);
app.post("/payment", setPayment);
app.post("/sendTrx", submitTrs);

app.listen(5000);