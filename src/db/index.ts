import PG from "pg";

const Pool = PG.Pool;

export const pool = new Pool({
  user: "remoteops-master",
  host: "localhost",
  database: "posgres",
  password: "metric123",
  port: 5432
});