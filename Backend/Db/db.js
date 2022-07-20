import {Pool} from "postgres-pool"
import 'dotenv/config'
const pgPool = new Pool({
    user: process.env.POSTGRES_USER,
    host:process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    port: process.env.POSTGRES_PORT,
    password: process.env.POSTGRES_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
})
export default pgPool