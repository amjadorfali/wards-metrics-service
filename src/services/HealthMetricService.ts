import {pool} from "../db";
import moment from "moment";

export class HealthMetricService {

    async getOverview(startDate: string | undefined, endDate: string | undefined) {
        const responseData = await pool.query(`
            SELECT floor(AVG(responseTime))                                 AS "performance",
                   floor(AVG(CASE WHEN status = 1 THEN 100.0 ELSE 0.0 END)) AS "uptime"
            
            FROM userevents_mock
            WHERE UserEvents_mock.timestamp > '${startDate}'::timestamp;
        `)
        const status = await pool.query(`
            SELECT status
            from userevents_mock
            where home_id = text(9)
            ORDER BY timestamp DESC
            LIMIT 1;
            
            `)
        const aggData = await pool.query(`
        SELECT start_time as "startTime", end_time as "endTime"
        FROM state_periods(
                (SELECT state_agg(timestamp, status)
                 FROM userevents_mock
                 WHERE timestamp > '${startDate}'::timestamp),
                 ${status.rows[0].status}
    );
            `, [])
        return {
            uptime: responseData.rows[0].uptime,
            performance: responseData.rows[0].performance,
            status: aggData.rows[aggData.rows.length - 1]
        }
    }

    getLogs(date: string) {
        pool.query("")
    }

    getDetails(date: string) {
        pool.query("")
    }

    getGraphData(startDate: string, endDate: string, type: string, location: string) {
       return  pool.query(this.getIntervalQuery(startDate, endDate, type, location))
    }

    create(metricId: string, method: string, responseTime: number, status: number, timestamp: number) {
        pool.query(
            "INSERT INTO healthMetric(metricId, method, responseTime, status, timestamp) VALUES ($1, $2, $3, $4, $5)",
            [metricId, method, responseTime, status, timestamp]);
    }

    getIntervalQuery(startDate: string, endDate: string, type: string, location: string) {
        const startDateMoment = moment(startDate)
        const endDateMoment = moment(endDate)

        if (startDateMoment.isSame(endDateMoment)) {
            return `
            SELECT location,
                   json_agg(json_build_object('responseTime', responseTime, 'status', status, 'timestamp', timestamp)) AS data
            from UserEvents_mock
            WHERE UserEvents_mock.timestamp >= now() - Interval '3 days'
            GROUP BY location;
            `
        } else {
            const view = startDateMoment.diff(endDateMoment, "d",) > 15 ? 'daily_user_events' : 'hourly_user_events'
            if (type === 'uptime') {
                return `
                SELECT location,
                       json_agg(json_build_object('average_status_percentage', average_status_percentage, 'timestamp', bucket)) AS data
                from ${view}
                WHERE bucket >= now() - Interval '3 days'
                GROUP BY location;      
                `
            } else {
                if (!location) {
                    return `
                SELECT bucket,
                       round(approx_percentile(0.1, rollup(average_response_time)))  as p10,
                       round(approx_percentile(0.5, rollup(average_response_time)))  as p50,
                       round(approx_percentile(0.9, rollup(average_response_time)))  as p90,
                       round(approx_percentile(0.95, rollup(average_response_time))) as p95,
                       round(approx_percentile(0.99, rollup(average_response_time))) as p99
                
                -- Database table will change based on DateFilter
                from ${view}
                WHERE bucket >= now() - Interval '3 days'
                GROUP BY bucket;
                    `
                } else {

                    return `
                    SELECT location,
                               bucket,
                               ARRAY(SELECT Cast(FLOOR(element) AS int)
                                     FROM UNNEST(approx_percentile_array(array [0.1, 0.5, 0.90, 0.95, 0.99],
                                                                         average_response_time)) AS element) AS floored_array
                        
                        from ${view}
                        WHERE bucket >= now() - Interval '3 days'
                        AND location = "${location}"
                        ORDER BY bucket DESC;                   
                    `
                }

            }
        }

    }
}
