import dbPool from "../Db/db";
import pgPool from "../Db/db";
// import {body, validationResult} from 'express-validator'
class categoryController {
    async createCategory(req,res){
        try{
            const {storeId, name, url, averagePrice, productCount} = req.body;
            const existingModel = await pgPool.query(`SELECT* from categories where name like $1`, [name])
            if(existingModel.rowCount > 0) res.status(400).json('Category already exists')
            const model = await pgPool.query(`INSERT INTO categories (store_id, name, url, average_price, product_count) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [storeId, name, url, averagePrice, productCount])
            res.status(200).json(model.rows[0])
        }catch(e){
            console.log(e)
        }
    }
    async getCategory(req,res){
        try{
            const id = req.params.id
            const model = await pgPool.query(`SELECT* FROM categories where id = $1`, [id])
            if(model.rowCount > 0)
                res.json(model.rows[0])
            else 
                return res.status(404).json('Category not found')
        }catch(e){
            console.log(e)
        }
    }
    async getCategoryByName(req,res){
        try{
            const name = req.params.name
            const model = await pgPool.query(`SELECT* FROM categories where name = $1`, [name])
            if(model.rowCount > 0)
                res.json(model.rows[0])
            else 
                return res.status(404).json('Category not found')
        }catch(e){
            console.log(e)
        }
    }
    async getCategoryByUrl(req,res){
        try{
            const url = req.params.url
            const model = await pgPool.query(`SELECT* FROM categories where url = $1`, [url])
            if(model.rowCount > 0)
                res.json(model.rows[0])
            else 
                return res.status(404).json('Category not found')
        }catch(e){
            console.log(e)
        }
    }
    async getCategoryPriceByUrl(req,res){
        try{
            const {url} = req.body
            const model = await pgPool.query(`SELECT average_price FROM categories where url like $1`, [url])
            if(model.rowCount > 0)
                res.json(model.rows[0]);
            else 
                return res.status(404).json('Category not found')
        }catch(e){
            console.log(e)
        }
    }
    async getCategories(req,res){
        try{
            const models = await pgPool.query('SELECT* FROM categories')
            res.json(models.rows)
        }catch(e){
            console.log(e)
        }
    }
    async updateCategory(req,res){
        try{
            const id = req.params.id
            const {averagePrice, productCount} = req.body; 
            const existingModel = await pgPool.query(`SELECT* FROM categories where id = $1`, [id])
            if(existingModel.rowCount <= 0)
                return res.status(404).json('Category not found')
            const query = await pgPool.query('UPDATE categories SET average_price = $1, product_count = $2 where id = $3', [averagePrice, productCount, id])
            if(query.rowCount >= 0)
                res.status(204).json('Successfully updated')
            else
                res.status(400)
        }catch(e){
            console.log(e)
        }
    }
    async addStore(req,res) {
        try{

            const id = req.params.id
            const model = await pgPool.query(`SELECT* FROM categories where id = $1`, [id])
            if(model.rowCount <= 0)
                return res.status(404).json('Category not found')                

            const {storeId} = req.body
            const existingModel = await pgPool.query('SELECT* FROM categories where id = $1', [id])
            // if(existingModel.rowCount <= 0)
            //     return res.status(404).json('Category not found')
            console.log(existingModel)
            const query = await pgPool.query('UPDATE categories SET store_id = $1 where id = $2', [storeId, id])
            if(query.rowCount >= 0)
                res.status(204).json('Successfully updated')
            else
                res.status(400)
        }catch(e){
            console.log(e)
        }
    }
    async deleteCategory(req,res){
        try{
            const id = req.params.id
            const existingModel = await pgPool.query(`SELECT* FROM categories where id = $1`, [id])
            if(existingModel.rowCount < 0)
                return res.status(404).json('Category not found')
            const query = await pgPool.query('DELETE FROM categories where id = $1', [id])
            if(query.rowCount >= 0)
                res.status(204).json('Successfully deleted')
            else
                res.status(400)
        }catch(e){
            console.log(e)
        }
    }
}
export default new categoryController()
