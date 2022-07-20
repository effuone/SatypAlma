import {Pool} from "postgres-pool"
import 'dotenv/config'
const pgPool = new Pool({
    user: 'kianoiiopkfhtu',
    host:'ec2-3-248-121-12.eu-west-1.compute.amazonaws.com',
    database: 'dapr1ft4kuusn2',
    port: 5432,
    password: '966a12c3a097391c5c121145d963df09542469e540ab3205ed2511b3cee73ee3',
    ssl: {
        rejectUnauthorized: false
    }
})
export default pgPool