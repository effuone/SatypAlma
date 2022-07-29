import cron from 'node-cron';
import Parser from '../api/Parser'
import cheerio from 'cheerio'
import * as fs from 'fs/promises'
import axios from "axios";
import SatypAlmaService from '../api/SatypAlmaService';

export const averageSulpakPricePerPage = async (pagedUrl) => {
    let totalSumPerPage = 0
    let availableProducts = 0
    const html = (await Parser.getHtml(pagedUrl)).data
    const $ = cheerio.load(html)
    $('.price-block', html).each(function () {
        const superPriceString = $(this).find('.super-price').text().replace(/\D/g, '')
        const priceString = ($(this).find('.price')).text().replace(/\D/g, '')
        if (superPriceString !== '') {
            availableProducts++
            totalSumPerPage += parseInt(superPriceString)
        }
        else {
            if (priceString !== '') {
                availableProducts++
                totalSumPerPage += parseInt(priceString)
            }
        }
    })
    return { totalSumPerPage, availableProducts }
}
export const sulpakProductsPerPage = async (singlePageUrl) => {
    const html = (await Parser.getHtml(singlePageUrl)).data
    const $ = cheerio.load(html)
    const products = []
    $('.goods-tiles', html).each(function() {
        const product = new Object();
        product.name = $(this).find('.title').text().replace(/\s+/g, ' ')
        product.image = $(this).find('.image-size-cls').attr('src') 
        const superPriceString = $(this).find('.super-price').text().replace(/\D/g, '')
        const priceString = ($(this).find('.price')).text().replace(/\D/g, '')
        if (superPriceString !== '') {
            product.price = parseInt(superPriceString)
        }
        else {
            if (priceString !== '') {
                product.price = parseInt(priceString)
                products.push(product)
            }
        }
    })
    return products
}
// function that returns number pages of in specific sulpak subCategory
export const maximumNumberOfSulpakPages = async (url) => {
    const html = (await Parser.getHtml(url)).data
    const $ = cheerio.load(html)
    const pageNumber = parseInt($('.pages-list', html).children().last().text())
    if (isNaN(pageNumber)) {
        return 1;
    }
    return pageNumber
}
// function that returns all average sulpak price per specific subCategory
export const averageSulpakPricePerSubCategory = async (url) => {
    let totalSum = 0;
    let totalAmountOfProducts = 0;
    const totalNumberOfPages = await maximumNumberOfSulpakPages(url)
    for (let i = 1; i <= totalNumberOfPages; i++) {
        const { totalSumPerPage, availableProducts } = await averageSulpakPricePerPage(url + `?page=${i}`)
        totalSum += totalSumPerPage;
        totalAmountOfProducts += availableProducts;
    }
    let averagePrice = Math.round(totalSum / totalAmountOfProducts)
    if (isNaN(averagePrice)) {
        averagePrice = 0
    }
    return { averagePrice, totalAmountOfProducts }
}
// function that returns all available categories in sulpak market service
export const getSulpakCategoryList = async (url) => {
    const html = (await Parser.getHtml(url)).data
    const $ = cheerio.load(html)
    const urls = []
    $('li.catalog-category-item', html).each(function () {
        const subUrl = url + $(this).find('a').attr('href')
        const categoryType = $(this).text().replace(/\s+/g, ' ').slice(1, -1)
        urls.push({ name: categoryType, url: subUrl })
    })
    return urls
}
// function that returns all available subcategories of one category in sulpak market service
export const getSulpakSubCategoryListOfOneCategory = async (storeUrl, category) => {
    const html = (await Parser.getHtml(category.url)).data
    const $ = cheerio.load(html)
    const subCategoryList = []
    $('.portal-part-item', html).each(function () {
        $(this).find('.portal-part-item-container').find('a').each(async function () {
            const name = $(this).text().replace(/\s+/g, ' ').slice(1, -1);
            let url = $(this).attr('href')

            if (url.startsWith('/f/')) {
                if (url.includes('/almaty')) {
                    url = url.substring(0, url.indexOf('almaty') - 1);
                }
                subCategoryList.push({ name, link: storeUrl + url })
            }
        })
        category.subCategories = subCategoryList
    })
    return category
}

export const getAllProductsByCategory = async (categoryUrl) => {
    const totalProducts = []
    const totalNumberOfPages = await maximumNumberOfSulpakPages(categoryUrl)
    for (let i = 1; i <= totalNumberOfPages; i++) {
        const products = await sulpakProductsPerPage(categoryUrl + `?page=${i}`)
        for (let j = 0; j < products.length; j++) {
            const product = products[j];
            totalProducts.push(product)
        }
    }
    return totalProducts
}

export const getBetterProduct = async (categoryUrl) => {
    const products = await getAllProductsByCategory(categoryUrl)
    const productLength = products.length
    products.sort((a,b)=>(a.price>b.price) ? 1 : -1);
    return products[165]
}
//получить существующие ссылки категории с сайта
export const getCategoryList = async (url) => {
    const categoryList = await getSulpakCategoryList(url)
    const categoryWithSubCategoriesList = []
    for (let i = 0; i < categoryList.length - 1; i++) {
        const category = categoryList[i];
        const categoryWithSubCategories = await getSulpakSubCategoryListOfOneCategory(url, category)
        categoryWithSubCategoriesList.push(categoryWithSubCategories)
    }
    const subCategories = []
    for (let i = 0; i < categoryWithSubCategoriesList.length; i++) {
        const subCategoriesArrayOfCategory = categoryWithSubCategoriesList[i].subCategories;
        if (subCategoriesArrayOfCategory !== null) {
            for (let j = 0; j < subCategoriesArrayOfCategory.length; j++) {
                subCategories.push(subCategoriesArrayOfCategory[j].link)
            }
        }
    }
    const linkList = [... new Set(subCategories)]
    await fs.writeFile('linkList.json', JSON.stringify(linkList))
}
//функция которая принимает массив ссылок категорий и возвращает массив с финальными категориями 
export const getCategoryListWithPrice = async (linkList) => {
    const categories = []
    for (let i = 0; i < linkList.length; i++) {
        const url = linkList[i];
        try {
            const productInfo = await averageSulpakPricePerSubCategory(url)
            const category = {
                name: url.substring(url.indexOf('/f/') + 3, url.length),
                url,
                averagePrice: productInfo.averagePrice,
                productCount: productInfo.totalAmountOfProducts
            }
            console.log(category)
            categories.push(category)
        } catch (e) {
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
export const addCategoriesToStore = async (store, fileName = 'categories.json') => {
    const categories = JSON.parse(await fs.readFile(fileName, { encoding: 'utf8' }));
    console.log(categories)
    for (let i = 0; i < categories.length; i++) {
        try {
            await SatypAlmaService.addCategory(store.id, categories[i])
            console.log(categories[i].url + ' parsed!')
        } catch (e) {
            console.log(e)
        }
        console.log(categories[i])
    }
}
export const updateDatabaseCategories = async () => {
    for (let i = 0; i < databaseCategories.length; i++) {
        const element = databaseCategories[i];
        const priceInfo = await SulpakService.averageSulpakPricePerSubCategory(element.url)
        const res = await SatypAlmaService.updateCategory(element.id, priceInfo)
        console.log(res.data)
    }
}