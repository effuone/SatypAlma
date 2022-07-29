import * as sulpak from '../services/SulpakService'

class productController {
    async getProduct (req,res)
    {
        try{
            const {url} = req.params.url
            console.log(url)
            const bestProduct = await sulpak.getBetterProduct(url)
            res.json(bestProduct)
        }catch(e){
            console.log(e)
        }
    }
}
export default new productController()
