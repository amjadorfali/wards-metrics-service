import express, {NextFunction, Request, response, Response} from "express";
import {healthMetricService} from "../services";
import {validate} from "../utils/validations";
import {body} from "express-validator";
import {getResponse} from "../utils/getResponse"
import moment from 'moment'
export const healthMetricRoute = express.Router();


healthMetricRoute.get("/overview",
    validate([]),
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const {startDate, endDate, taskId } = req.query as { startDate: string, endDate: string, taskId:string }
        return healthMetricService.getOverview(startDate, endDate,taskId)
            .then(response => res.json(getResponse.success(response)))
            .catch((e) => {
                next(e);
            });
    });

healthMetricRoute.get("/logs",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const {startDate, endDate,taskId, offset} = req.query as any
        return healthMetricService.getLogs(startDate, endDate, taskId, offset);
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
        const {startDate, endDate, type, location,taskId} = req.query as any
        return healthMetricService.getGraphData(startDate, moment(endDate).endOf('day').format(), type, location, taskId)
            .then(response => res.json(getResponse.success(response)))
            .catch((e) => {
                next(e);
            });
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

