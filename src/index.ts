import express from "express";

require("dotenv").config();

import helmet from "helmet";
import {standardLimiter} from "./utils/rateLimiters";
import {healthMetric} from "./routes/healthMetric";
import bodyParser from "body-parser";
import { pool } from "./db";



const app = express();
const
app.use(helmet());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.raw());

pool.connect()

app.use("/api/task/health", standardLimiter, healthMetric);


const port = 3201;
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
