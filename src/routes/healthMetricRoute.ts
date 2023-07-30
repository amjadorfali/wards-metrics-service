import express, {NextFunction, Request, response, Response} from "express";
import {healthMetricService} from "../services";
import {validate} from "../utils/validations";
import {body} from "express-validator";
import {getResponse} from "../utils/getResponse";

export const healthMetricRoute = express.Router();


healthMetricRoute.get("/overview",
    validate([]),
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const {startDate, endDate} = req.query as { startDate: string, endDate: string }
        return healthMetricService.getOverview(startDate, endDate)
            .then(response => res.json(getResponse.success(response)))
            .catch((e) => {
                next(e);
            });
    });
healthMetricRoute.get("/logs",
    validate([
        body("date", "InvalidValue"),
    ]),
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const {startDate, endDate} = req.params
        return healthMetricService.getOverview(startDate, endDate);
    });
healthMetricRoute.get("/details",
    validate([
        body("date", "InvalidValue"),
    ]),
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const {startDate, endDate} = req.params
        return healthMetricService.getOverview(startDate, endDate);
    });
healthMetricRoute.get("/graph",
    validate([
        body("date", "InvalidValue"),
    ]),
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const {startDate, endDate, type, location} = req.params
        return healthMetricService.getGraphData(startDate, endDate, type, location);
    });
healthMetricRoute.post("/",
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
        const {metricId, method, responseTime, status, timestamp} = req.body;
        return healthMetricService.create(metricId, method, responseTime, status, timestamp);
    });

