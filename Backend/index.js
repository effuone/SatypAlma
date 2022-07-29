import express, { json } from "express";
import 'dotenv/config'
import { storeRouter, categoryRouter, productRouter } from "./routes/routes";
import * as sulpak from './services/SulpakService'
const PORT = process.env.PORT || 8080

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

const app = express()
app.use(express.json())
app.use(allowCrossDomain)
app.use('/test', async (req, res) => {
    res.send('Working')
})
app.use('/api/', storeRouter)
app.use('/api/', categoryRouter)
app.use('/api/', productRouter)
app.listen(PORT, () => {
    console.log('Satyp Alma backend launched.')
})
// console.log((await SatypAlmaService.addStoreToCategory(category.id, store.id)))
// console.log(await SatypAlmaService.getCategories())

// const html = (await Parser.getScrappedHtml('7c34bca6c36621292235dc6140f0cf9e', 'https://kaspi.kz/shop/nur-sultan/c/smartphones/class-apple/')).data
// const $ = cheerio.load(html)
// const prices = []
// $('.item-card__prices-price', html).each(function () {
//     prices.push(parseInt($(this).text().replace(/\D/g, '')))
// })
// console.log(prices)

// const url = 'https://www.sulpak.kz/f/smartfoniy'
// const bestProduct = await sulpak.getBetterProduct(url)
// console.log(bestProduct)

// cron.schedule('1 0 4 * * Monday', async () => {
//     //Sulpak scheduling update
//     console.log('start')
//     try{
//         // // get available urls
//         // await getCategoryList(store.url)
//         // // read from file those urls
//         // const linkList = JSON.parse(await fs.readFile('linkList.json', {encoding: "utf-8"}))
//         // const updatedCategories = await getCategoryListWithPrice(linkList)
//         const dbCategories = await SatypAlmaService.getCategories()
//         for (let i = 0; i < dbCategories.length; i++) {
//             const category = dbCategories[i];
//             const newProductInfo = await averageSulpakPricePerSubCategory(category.url)
//             console.log(newProductInfo)
//             const updatedCategory = await SatypAlmaService.updateCategory(category.id, newProductInfo)
//             console.log(updatedCategory)
//         }
//     }catch(e){
//         console.log(e)
//     }
//     //creation
//     // const categories = JSON.parse((await fs.readFile('categories.json', {encoding:'utf-8'})))
//     // for (let i = 0; i < categories.length; i++) {
//     //     try{
//     //         const element = categories[i];
//     //         const data = await SatypAlmaService.addCategory(store.id, element)
//     //         console.log(data + 'parsed!')
//     //     }catch(e){
//     //         console.log(e)
//     //     }
//     // }
// });