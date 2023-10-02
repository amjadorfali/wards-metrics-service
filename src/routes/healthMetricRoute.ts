import express, {NextFunction, Request, response, Response} from "express";
import {healthMetricService} from "../services";
import {validate} from "../utils/validations";
import {body, param} from "express-validator";
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
        const {startDate, endDate, taskId} = req.query as { startDate: string, endDate: string, taskId: string }
        return healthMetricService.getOverview(startDate, endDate, taskId)
            .then(response => res.json(getResponse.success(response)))
            .catch((e) => {
                next(e);
            });
    });

healthMetricRoute.put("/logs",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const {incidentsOnly, offset, limit, startDate, endDate, taskId} = req.body as any
        return healthMetricService.getLogs(startDate, endDate, taskId, incidentsOnly, offset, limit).then(response => res.json(getResponse.success(response.rows)))
            .catch((e) => {
                next(e);
            });
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
        const {startDate, endDate, type, location, taskId} = req.query as any
        return healthMetricService.getGraphData(startDate, moment(endDate).endOf('day').format(), type, location, taskId)
            .then(response => res.json(getResponse.success(response)))
            .catch((e) => {
                next(e);
            });
    });

healthMetricRoute.post("/:id",
    validate([
        param("id", "InvalidValue").isString(),
        body("location", "InvalidValue").isString(),
        body("status", "InvalidValue").isNumeric(),
        body("responseCode", "InvalidValue").isNumeric(),
        body("assertions", "InvalidValue"),
        body("responseTime", "InvalidValue").isNumeric(),
        body("method", "InvalidValue").isString(),
        body("date", "InvalidValue").isString(),
        body("errReason", "InvalidValue").isString()
    ]),
    async (
        req: Request<any, any, {
            id: string;
            location: string;
            status: number,
            responseCode: number,
            assertions: string,
            responseTime: number,
            method: string,
            date: Date,
            errReason: string
        }>,
        res: Response,
        next: NextFunction
    ) => {
        return healthMetricService.postMetric({
            id: req.params.id,
            location: req.body.location,
            responseCode: req.body.responseCode,
            responseTime: req.body.responseTime,
            assertions: req.body.assertions,
            errReason: req.body.errReason,
            method: req.body.method,
            date: req.body.date,
            status: req.body.status,
        }).then(response => res.json(getResponse.success(response)))
            .catch((e) => {
                next(e);
            });
    });

