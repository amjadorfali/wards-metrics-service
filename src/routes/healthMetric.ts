import express, { NextFunction, Request, Response } from "express";
import { healthMetricService } from "../services";
import { validate } from "../utils/validations";
import { body } from "express-validator";

export const healthMetric = express.Router();


healthMetric.get("/", async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return healthMetricService.getAll("req.user.uid");
});

healthMetric.post("/",
  validate([
    body("userId", "InvalidValue").isString(),
    body("metricId", "InvalidValue").isString(),
    body("method", "InvalidValue").isString(),
    body("responseTime", "InvalidValue").isString(),
    body("result", "InvalidValue").isString(),
    body("time", "InvalidValue").isString(),
    body("region", "InvalidValue").isString()
  ]),
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { metricId, method, responseTime, status, timestamp } = req.body;
    return healthMetricService.create(metricId, method, responseTime, status, timestamp);
  });

