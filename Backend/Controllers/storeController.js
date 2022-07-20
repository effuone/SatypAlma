import dbPool from "../Db/db";
import pgPool from "../Db/db";

// import {body, validationResult} from 'express-validator'
class storeController {
    async createStore(req,res){
        try{
            const {name, url, parsable} = req.body;
            const newStore = await pgPool.query(`INSERT INTO stores (name, url, parsable) VALUES ($1, $2, $3) RETURNING *`, [name,url,parsable])

            res.json(newStore.rows[0])
        }catch(e){
            console.log(e)
        }
    }
    async getStore(req,res){
        try{
            const id = req.params.id
            const model = await pgPool.query(`SELECT* FROM stores where id = $1`, [id])
            if(model.rowCount > 0)
                res.json(model.rows[0])
            else 
                return res.status(404).json('Store not found')
        }catch(e){
            console.log(e)
        }
    }
    async getStores(req,res){
        try{
            const stores = await pgPool.query('SELECT* FROM stores')
            res.json(stores.rows)
        }catch(e){
            console.log(e)
        }
    }
    async updateStore(req,res){
        try{
            const id = req.params.id
            const {name, url, parsable} = req.body 
            const model = await pgPool.query(`SELECT* FROM stores where id = $1`, [id])
            if(model.rowCount <= 0)
                return res.status(404).json('Store not found')
            const query = await pgPool.query('UPDATE stores SET name = $1, url = $2, parsable = $3', [name, url, parsable])
            if(query.rowCount >= 0)
                res.status(204).json('Successfully updated')
            else
                res.status(400)
        }catch(e){
            console.log(e)
        }
    }
    async deleteStore(req,res){
        try{
            const id = req.params.id
            const query = await pgPool.query('DELETE FROM stores where id = $1', [id])
            if(query.rowCount >= 0)
                res.status(204).json('Successfully deleted')
            else
                res.status(400)
        }catch(e){
            console.log(e)
        }
    }
}
export default new storeController()