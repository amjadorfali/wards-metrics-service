import PG from "pg";

const Pool = PG.Pool;

export const pool = new Pool({
    user: process.env.TIMESCALE_USER,
    host: process.env.TIMESCALE_HOST,
    database: process.env.TIMESCALE_DATABASE,
    password: process.env.TIMESCALE_PASSWORD,
    port: 5432
});
