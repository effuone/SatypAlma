import {Pool} from "postgres-pool"
import 'dotenv/config'
const pgPool = new Pool({connectionString: process.env.DATA})
export default pgPool