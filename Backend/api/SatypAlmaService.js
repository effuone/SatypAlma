import axios from "axios"
import 'dotenv/config'
export default class SatypAlmaService
{
    static async getStore(id)
    {
        try{
            const response = await axios.get(process.env.WEB_URL+'/api/stores/' + id)
            return response.data
        }catch(e){
            console.log(e)
        }
    }
    static async getStore(name)
    {
        try{
            const response = await axios.get(process.env.WEB_URL+'/api/stores/' + name)
            return response.data
        }catch(e){
            console.log(e)
        }
    }
    static async addStore(store)
    {
        try{
            const response = await axios({
                method: 'post',
                url: process.env.WEB_URL+'/api/stores',
                data: {
                    'name': store.name,
                    'url': store.url,
                    'parsable': store.parsable,
                },
                headers: {
                  'Content-Type': 'application/json'
                } 
            })
            return response.data
        }catch(e){
            console.log(e)
        }
    }
    static async getStores()
    {
        try{
            const response = await axios.get(process.env.WEB_URL+'/api/stores/')
            return response.data
        }catch(e){
            console.log(e)
        }
    }
    static async getCategories()
    {
        try{
            const response = await axios(process.env.WEB_URL+'/api/categories')
            return response.data
        }catch(e){
            console.log(e)
        }
    }
    static async addCategory(storeId, category)
    {
        try{
            const response = await axios({
                method: 'post',
                url: process.env.WEB_URL+'/api/categories',
                data: {
                    'storeId': storeId,
                    'name': category.name,
                    'url': category.url,
                    'averagePrice': category.averagePrice,
                    'productCount': category.productCount
                },
                headers: {
                  'Content-Type': 'application/json'
                } 
            })
            return response.data
        }catch(e){
            console.log(e)
        }
    }
    static async updateCategory(categoryId, productInfo)
    {
        try{
            const response = await axios({
                method: 'put',
                url: process.env.WEB_URL+'api/categories/' + categoryId,
                data: {
                    'averagePrice': productInfo.averagePrice,
                    'productCount': productInfo.totalAmountOfProducts
                },
                headers: {
                  'Content-Type': 'application/json'
                }
            })
            return response.data
        }catch(e){
            console.log(e)
        }
    }
    static async getCategoryByName(name)
    {
        const encodedName = encodeURIComponent(name)
        try {
            const res = await axios.get(process.env.WEB_URL+'/api/categories/name/' + encodedName);
            return res.status
        }catch (err) {
            if(err.response) {
              return err.response.status
            }
        }
    }
    static async getCategoryByUrl(url)
    {
        const encodedUrl = encodeURIComponent(url)
        try {
            const res = await axios.get(process.env.WEB_URL+'/api/categories/url/' + encodedUrl);
            return res
        }catch (err) {
            if(err.response) {
              return err.response.status
            }
        }
    }
}