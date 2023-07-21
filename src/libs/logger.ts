import winston from "winston";
// import { LOG_DIR } from "../config";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: {},
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({
    //   filename: [LOG_DIR, "error.log"].join("/"),
    //   level: "error",
    // }),
  ],
});
