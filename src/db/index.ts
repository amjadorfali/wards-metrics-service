import PG, {Client} from "pg";

const Pool = PG.Pool;
//TODO: THINK OF EVENTS AND ERROR HANDLING https://node-postgres.com/apis/pool#releasing-clients
export const pool = new Pool({
    user: process.env.TIMESCALE_USER,
    host: process.env.TIMESCALE_HOST,
    database: process.env.TIMESCALE_DATABASE,
    password: process.env.TIMESCALE_PASSWORD,
    port: 5432
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
})