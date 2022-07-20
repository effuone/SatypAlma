import {Pool} from "postgres-pool"
import 'dotenv/config'
const pgPool = new Pool({
    user: 'satypalmauser',
    host:'localhost',
    database: 'satypalmadb',
    port: 5432,
    password: 'satypalmauser123'
    // ssl: {
    //     rejectUnauthorized: false
    // }
})
export default pgPool