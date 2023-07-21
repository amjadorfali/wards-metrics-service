import { pool } from "../db";

export class HealthMetricService {

  getAll(userId: string) {
  }

  create(metricId: string, method: string, responseTime: number, status: number, timestamp: number) {
    pool.query(
      "INSERT INTO healthMetric(metricId, method, responseTime, status, timestamp) VALUES ($1, $2, $3, $4, $5)",
      [metricId, method, responseTime, status, timestamp]);
  }

}
