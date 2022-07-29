import {Pool} from "postgres-pool"
import 'dotenv/config'
const pgPool = new Pool({connectionString: process.env.DATABASE_URL, ssl:{
    rejectUnauthorized: false
}})
export default pgPool