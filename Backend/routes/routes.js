import { Router } from "express";
import storeController from '../controllers/storeController'
import categoryController from '../controllers/categoryController'
import productController from "../controllers/productController";
export const storeRouter = new Router();
storeRouter.post('/stores/', storeController.createStore)
storeRouter.get('/stores/', storeController.getStores)
storeRouter.get('/stores/:id', storeController.getStore)
storeRouter.put('/stores/:id', storeController.updateStore)
storeRouter.delete('/stores/:id', storeController.deleteStore)

export const categoryRouter = new Router();
storeRouter.post('/categories/', categoryController.createCategory)
storeRouter.get('/categories/', categoryController.getCategories)
storeRouter.get('/categories/:id', categoryController.getCategory)
storeRouter.get('/categories/name/:name', categoryController.getCategoryByName)
storeRouter.get('/categories/url/:url', categoryController.getCategoryByUrl)
storeRouter.get('/price/', categoryController.getCategoryPriceByUrl)
storeRouter.put('/categories/:id', categoryController.updateCategory)
storeRouter.delete('/categories/:id', categoryController.deleteCategory)
export const productRouter = new Router();
productRouter.get('/products/:url', productController.getProduct)