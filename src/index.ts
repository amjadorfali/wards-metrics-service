import express from "express";

let environment = process.env.ACTIVE_PROFILE;

if (!environment) {
    require('dotenv').config();
    environment = process.env.ACTIVE_PROFILE;
}


import helmet from "helmet";
import {standardLimiter} from "./utils/rateLimiters";
import {healthMetricRoute} from "./routes/healthMetricRoute";
import bodyParser from "body-parser";
import { pool } from "./db";
import cors from "cors";
const app = express();

app.use(cors());
app.use(healthMetricRoute)
app.use(helmet());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.raw());

pool.connect()

app.use("/api/health", standardLimiter, healthMetricRoute);

app.get("/api/health-check",(req, res) => {
  return res.json().status(200)
});
const port = 3201;
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
