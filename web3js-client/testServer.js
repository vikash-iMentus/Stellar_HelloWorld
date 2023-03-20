import express from "express";
import { Hello1 } from "./test_hello/hello1.js";
import { Hello2 } from "./test_hello/hello2.js";
import { World } from "./test_hello/world1.js";
import { submitTrs } from "./submitTrx.js";
import dotenv from "dotenv"
dotenv.config();
const port = 5000;
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from express");
});

app.post("/hello1", Hello1);
app.post("/hello2", Hello2);
app.post("/world", World);
app.post("/sendTrx", submitTrs);

app.listen(port, () => console.log('App listening on port ' + port));