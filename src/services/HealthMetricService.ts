import {pool} from "../db";
import moment from "moment";

type Percentile  = {data : string, responseTime : number}
interface ResponseTimePercentiles {
    p10: Percentile[],
    p50: Percentile[],
    p90: Percentile[],
    p95: Percentile[],
    p99: Percentile[]
}
export class HealthMetricService {

    async getOverview(startDate: string | undefined, endDate: string | undefined, taskId:string) {
        const responseData = await pool.query(`
            SELECT floor(AVG(responseTime))                                 AS "performance",
                   floor(AVG(CASE WHEN status = 1 THEN 100.0 ELSE 0.0 END)) AS "uptime"
            
            FROM HealthMetric
            WHERE HealthMetric.timestamp >= '${startDate}'::timestamp
                AND HealthMetric.timestamp <= '${endDate}'::timestamp;
        `)
        // TODO: Change to taskId
        const status = await pool.query(`
            SELECT status
            from HealthMetric
            WHERE taskId = text(${taskId})
            ORDER BY timestamp DESC
            LIMIT 1;
            
            `)
            // TODO: Change to taskId
        const aggData = await pool.query(`
        SELECT start_time as "startTime", end_time as "endTime"
        FROM state_periods(
                (SELECT state_agg(timestamp, CAST(status as BIGINT))
                 FROM HealthMetric WHERE taskId = text(${taskId})),
                 ${status.rows[0].status}
                 );
                 `, [])
        return {
            uptime: responseData.rows[0].uptime,
            performance: responseData.rows[0].performance,
            status: aggData.rows[aggData.rows.length - 1]
        }
    }

    // TODO:Filter by incidents if needed (Status != 1)
    getLogs(startDate: string | undefined, endDate: string | undefined, taskId: string, offset: number = 0,limit:number=0) {
      return  pool.query(`
        SELECT *
        FROM HealthMetric
        WHERE timestamp >= '${startDate}'::timestamp
            AND timestamp <= '${endDate}'::timestamp 
            AND taskId = '${taskId}'

        ORDER BY timestamp DESC
        OFFSET ${offset}
        LIMIT ${limit}
`)
    }

    getDetails(date: string) {
        pool.query("")
    }

    getGraphData(startDate: string, endDate: string, type:string, region: string, taskId: string) {
       return  this.queryDataInterval(startDate, endDate, type, region, taskId)
    }

    create(metricId: string, method: string, responseTime: number, status: number, timestamp: number) {
        pool.query(
            "INSERT INTO healthMetric(metricId, method, responseTime, status, timestamp) VALUES ($1, $2, $3, $4, $5)",
            [metricId, method, responseTime, status, timestamp]);
    }

    async queryDataInterval(startDate: string, endDate: string, type: string, region: string, taskId:string) {
        const startDateMoment = moment(startDate)
        const endDateMoment = moment(endDate)

        if (startDateMoment.isSame(endDateMoment, 'd')) {

            // Fetch all data from the DB for a single day
            // TODO: Change to taskId
            const {rows} = await pool.query<{
                region: string,
                data: { responseTime: number, status: number, timestamp: string }[]
            }>(`
            SELECT region,
                   json_agg(json_build_object('responseTime', responseTime, 'status', status, 'timestamp', timestamp)) AS data
            from HealthMetric
            WHERE 
                taskId = text(${taskId})
                AND timestamp >= '${startDate}'::timestamp
                AND timestamp <= '${endDate}'::timestamp
            GROUP BY region;
            `)

            return rows
        } else {
            const view = startDateMoment.diff(endDateMoment, "d",) > 15 ? 'daily_health_metrics' : 'hourly_health_metrics'
            if (type === 'uptime') {
            // Fetch the Uptime from VIEW for a date interval
            // TODO: Change to taskId

                const {rows}  = await pool.query<{region:string, data:{'average_status_percentage':number, timestamp:string }[]}>(`
                SELECT region,
                       json_agg(json_build_object('average_status_percentage', average_status_percentage, 'timestamp', bucket)) AS data
                from ${view}
                WHERE 
                    taskId = text(${taskId})
                    AND bucket >= '${startDate}'::timestamp
                    AND bucket <= '${endDate}'::timestamp
                GROUP BY region;      
                `)


                return rows
            } else {
                if (!region) {
            // Fetch the ResponseTime from VIEW for a date interval for all regions
            // TODO: Change to taskId

                    const {rows} =  await pool.query<{bucket:string, "p10":number,
                    "p50":number,
                    "p90":number,
                    "p95":number,
                    "p99":number
                }>(`
                SELECT bucket,
                       round(approx_percentile(0.1, rollup(average_response_time)))  as p10,
                       round(approx_percentile(0.5, rollup(average_response_time)))  as p50,
                       round(approx_percentile(0.9, rollup(average_response_time)))  as p90,
                       round(approx_percentile(0.95, rollup(average_response_time))) as p95,
                       round(approx_percentile(0.99, rollup(average_response_time))) as p99
                from ${view}
                WHERE 
                    taskId = text(${taskId})
                    AND bucket >= '${startDate}'::timestamp
                    AND bucket <= '${endDate}'::timestamp
                GROUP BY bucket;
                    `)

                    
                    return rows.reduce<ResponseTimePercentiles> ((prev, curr)=>{
                                    const {bucket, p10, p50, p90, p95, p99} = curr
                                    prev.p10.push({data: bucket, responseTime: p10})
                                    prev.p50.push({data: bucket, responseTime: p50})
                                    prev.p90.push({data: bucket, responseTime: p90})
                                    prev.p95.push({data: bucket, responseTime: p95})
                                    prev.p99.push({data: bucket, responseTime: p99})
                                    return prev
                                
                        }, {p10 : [], p50 : [], p90 : [], p95 : [], p99 : [] } as ResponseTimePercentiles);

                } else {
            // Fetch the ResponseTime from VIEW for a date interval for 1 region
            // TODO: Change to taskId
                    const {rows} = await pool.query<{bucket:string, 'floored_array': [number,number,number,number,number]}>(`
                    SELECT region,
                               bucket,
                               ARRAY(SELECT Cast(FLOOR(element) AS int)
                                     FROM UNNEST(approx_percentile_array(array [0.1, 0.5, 0.90, 0.95, 0.99],
                                                                         average_response_time)) AS element) AS floored_array
                        from ${view}
                        WHERE 
                            taskId = text(${taskId})
                            AND region = '${region}'
                            AND bucket >= '${startDate}'::timestamp
                            AND bucket <= '${endDate}'::timestamp
                        ORDER BY bucket DESC;                   
                    `)

                    return rows.reduce<ResponseTimePercentiles> ((prev, curr)=>{
                        const {bucket, floored_array} = curr
                        prev.p10.push({data: bucket, responseTime: floored_array[0]})
                        prev.p50.push({data: bucket, responseTime: floored_array[1]})
                        prev.p90.push({data: bucket, responseTime: floored_array[2]})
                        prev.p95.push({data: bucket, responseTime: floored_array[3]})
                        prev.p99.push({data: bucket, responseTime: floored_array[4]})

                        return prev
                    },{p10 : [], p50 : [], p90 : [], p95 : [], p99 : [] } as ResponseTimePercentiles)
                }

            }
        }

    }
}




