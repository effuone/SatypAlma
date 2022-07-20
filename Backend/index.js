import express, { json } from "express";
import cors from 'cors'
import {} from 'dotenv'
import SatypAlmaService from "./API/SatypAlmaService";
import 'dotenv/config'
import {storeRouter, categoryRouter} from "./Routes/routes";
import cron from 'node-cron';
import Parser from './API/Parser'
import cheerio from 'cheerio'
import * as fs from 'fs/promises'
import pgPool from "./Db/db";

const averageSulpakPricePerPage = async (pagedUrl) => {
    let totalSumPerPage = 0
    let availableProducts = 0
    const html = (await Parser.getHtml(pagedUrl)).data
    const $ = cheerio.load(html)
    $('.price-block', html).each(function(){
        const superPriceString = $(this).find('.super-price').text().replace(/\D/g, '')
        const priceString = ($(this).find('.price')).text().replace(/\D/g,'')
        if(superPriceString!=='')
        {
            availableProducts++
            totalSumPerPage+=parseInt(superPriceString)
        }
        else
        {
            if(priceString !== '')
            {
                availableProducts++
                totalSumPerPage+=parseInt(priceString)
            }
        }
    })
    return {totalSumPerPage, availableProducts}
}
// function that returns number pages of in specific sulpak subCategory
const maximumNumberOfSulpakPages = async (url) => {
    const html = (await Parser.getHtml(url)).data
    const $ = cheerio.load(html)
    const pageNumber = parseInt($('.pages-list', html).children().last().text())
    if(isNaN(pageNumber))
    {
        return 1;
    }
    return pageNumber
}
// function that returns all average sulpak price per specific subCategory
const averageSulpakPricePerSubCategory = async (url) => {
    let totalSum = 0;
    let totalAmountOfProducts = 0;
    const totalNumberOfPages = await maximumNumberOfSulpakPages(url)
    for (let i = 1; i <= totalNumberOfPages; i++) {
        const {totalSumPerPage, availableProducts} = await averageSulpakPricePerPage(url + `?page=${i}`)
        totalSum+=totalSumPerPage;
        totalAmountOfProducts+=availableProducts;
    }
    let averagePrice = Math.round(totalSum/totalAmountOfProducts)
    if(isNaN(averagePrice))
    {
        averagePrice = 0
    }
    return {averagePrice, totalAmountOfProducts}
}
// function that returns all available categories in sulpak market service
const getSulpakCategoryList = async(url) => {
    const html = (await Parser.getHtml(url)).data
    const $ = cheerio.load(html)
    const urls = []
    $('li.catalog-category-item', html).each(function(){
        const subUrl = url + $(this).find('a').attr('href')
        const categoryType = $(this).text().replace(/\s+/g, ' ').slice(1,-1)
        urls.push({name: categoryType, url: subUrl})
    })
    return urls
}
// function that returns all available subcategories of one category in sulpak market service
const getSulpakSubCategoryListOfOneCategory = async(storeUrl, category) => {
        const html = (await Parser.getHtml(category.url)).data
        const $ = cheerio.load(html)
        const subCategoryList = []
        $('.portal-part-item', html).each(function(){
            $(this).find('.portal-part-item-container').find('a').each(async function(){
                const name = $(this).text().replace(/\s+/g, ' ').slice(1,-1);
                let url = $(this).attr('href')
                
                if(url.startsWith('/f/'))
                {
                    if(url.includes('/almaty'))
                    {
                        url = url.substring(0, url.indexOf('almaty') - 1);
                    }
                    subCategoryList.push({name, link: storeUrl+url})
                }
            })
            category.subCategories = subCategoryList
        })
    return category
}
//получить существующие ссылки категории с сайта
const getCategoryList = async (url) => {
    const categoryList = await getSulpakCategoryList(url)
    const categoryWithSubCategoriesList = []
    for (let i = 0; i < categoryList.length-1; i++) {
        const category = categoryList[i];
        const categoryWithSubCategories = await getSulpakSubCategoryListOfOneCategory(url, category)
        categoryWithSubCategoriesList.push(categoryWithSubCategories)
    }
    const subCategories = []
    for (let i = 0; i < categoryWithSubCategoriesList.length; i++) {
        const subCategoriesArrayOfCategory = categoryWithSubCategoriesList[i].subCategories;
        if(subCategoriesArrayOfCategory !== null)
        {
            for (let j = 0; j < subCategoriesArrayOfCategory.length; j++) {
                subCategories.push(subCategoriesArrayOfCategory[j].link)
            }
        }
    }
    return [... new Set(subCategories)]
}
//функция которая принимает массив ссылок категорий и возвращает массив с финальными категориями 
const getCategoryListWithPrice = async (linkList) => {
    const categories = []
    for (let i = 0; i < linkList.length; i++) {
        const url = linkList[i];
        try{
            const productInfo = await averageSulpakPricePerSubCategory(url)
            const category = {
                name: url.substring(url.indexOf('/f/')+3, url.length),
                url, 
                averagePrice: productInfo.averagePrice, 
                productCount: productInfo.totalAmountOfProducts
            }
            console.log(category)
            categories.push(category)
        }catch(e){
            console.log(e)
        }
    }
    fs.writeFile('categories.json', JSON.stringify(categories), err => {
        if (err) {
            console.error(err);
        }
        // file written successfully
    });
    return categories
}
const addCategoriesToStore = async (store, fileName = 'categories.json') => {
    const categories = JSON.parse(await fs.readFile(fileName, { encoding: 'utf8' }));
    console.log(categories)
    for (let i = 0; i < categories.length; i++) {
        try{
            await SatypAlmaService.addCategory(store.id, categories[i])
            console.log(categories[i].url + ' parsed!')
        }catch(e){
            console.log(e)
        } 
        console.log(categories[i])
    }
}
const updateDatabaseCategories = async ()=>{
    for (let i = 0; i < databaseCategories.length; i++) {
        const element = databaseCategories[i];
        const priceInfo = await SulpakService.averageSulpakPricePerSubCategory(element.url)
        const res = await SatypAlmaService.updateCategory(element.id, priceInfo)
        console.log(res.data)
    }
}



const app = express()
app.use(express.json())
app.use('/api/', storeRouter)
app.use('/api/', categoryRouter)
app.use(cors())
app.listen(process.env.PORT, ()=>{
    console.log('Satyp Alma backend launched.')
})  
try{
    const rowsOfCreatingStores = (await pgPool.query('CREATE TABLE stores(id SERIAL PRIMARY KEY,name VARCHAR(255),url VARCHAR(255),parsable BOOLEAN);')).rowCount
    const rowsOfCreatingCategories = await pgPool.query('CREATE TABLE categories(id SERIAL PRIMARY KEY, store_id int REFERENCES stores (id) ON UPDATE CASCADE ON DELETE CASCADE, name VARCHAR(255), url VARCHAR(255), average_price INT, product_count INT);').rowCount
    console.log(rowsOfCreatingStores)
    console.log(rowsOfCreatingCategories)
    await SatypAlmaService.addStore({
        name: 'Sulpak.kz',
        url: 'https://www.sulpak.kz',
        parsable: true
    })
}catch(e){
    console.log(e)
}

const store = await SatypAlmaService.getStore(1)
const categories = JSON.parse((await fs.readFile('categories.json', {encoding:'utf-8'})))
for (let i = 0; i < categories.length; i++) {
    try{
        const element = categories[i];
        const data = await SatypAlmaService.addCategory(store.id, element)
        console.log(data + 'parsed!')
    }catch(e){
        console.log(e)
    }
}
// console.log((await SatypAlmaService.addStoreToCategory(category.id, store.id)))

// cron.schedule('1 33 0 * * Tuesday', async () => {
//     try{
//         const store = await SatypAlmaService.getStore(1)
//         const subCategories = await getCategoryList(store.url)
//         await fs.writeFile('linkList.json', JSON.stringify(subCategories))
//         const linkList = JSON.parse(await fs.readFile('linkList.json', {encoding:'utf-8'}))
//         for (let i = 0; i < linkList.length; i++) {
//             const url = linkList[i];
//             const existingCategory = await SatypAlmaService.getCategoryByUrl(url)
//             if(existingCategory)
//             {
//                 const productInfo = await averageSulpakPricePerSubCategory(url)
//                 await SatypAlmaService.updateCategory(existingCategory.id, productInfo)
//             }
//         }
//     }catch(e){
//         console.log(e)
//     }
// });