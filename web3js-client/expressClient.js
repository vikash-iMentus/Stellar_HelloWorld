import express from "express";
import fetch from "node-fetch"; // required for airdrop
import { paymentClient } from "./paymentClientFile.js";
import { submitTrs } from "./submitTrx.js";
import { helloClient } from "./fileClient.js";
import * as SorobanClient from "soroban-client" // // import * as SorobanClient from "stellar-sdk"
import dotenv from "dotenv"
dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from express");
});

app.post("/hello", helloClient);
app.post("/payment", paymentClient);
app.post("/sendTrx", submitTrs);

app.listen(5000);