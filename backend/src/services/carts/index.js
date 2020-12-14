const express = require("express")
const multer = require("multer")
//const fs = require("fs")
const { writeFile, createReadStream } = require("fs-extra")
const path = require("path")
const uniqid = require("uniqid")
const { readDB, writeDB } = require("../lib/utilities")
const { check, validationResult } = require("express-validator")
const {join} = require("path")

const upload = multer({})

const router = express.Router()


const cartsFilePath = path.join(__dirname, "carts.json")
const productFilePath = join(__dirname, "../products/product.json")
router.get("/", async (req, res, next) => {
    try {
      const cartDB = await readDB(cartsFilePath);
      if (cartDB.length > 0) {
        res.status(200).send(cartDB);
      } else {
        const err = {};
        err.httpStatusCode = 404;
        err.message = "The cart database is empty dood";
        next(err);
      }
    } catch (err) {
      err.httpStatueCode = 404;
      next(err);
    }
  })
  router.get("/:cartId", async (req, res, next) => {
    try {
      const cartDB = await readDB(cartsFilePath);
      const selectedCart = cartDB.findIndex(
        
        (cart) => cart._id === req.params.cartId
      );
      if (selectedCart !== -1) {
        
        res.status(200).send(cartDB[selectedCart]);
      } else {
        const err = {};
        err.httpStatusCode = 404;
        err.message = " that ID doesn't exist";
        next(err);
      }
    } catch (err) {
      err.httpStatueCode = 404;
      next(err);
    }
  });
  
  router.post("/",   [
    check("ownerId").exists().withMessage("We need your unique id"),
    check("name").exists().withMessage("You need to give your first name"),
    check("surname").exists().withMessage("You need to give your surname"),
  
  ],async(req,res,next)=>{

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = {};
      err.message = errors;
      err.httpStatusCode = 400;
      next(err);
    } else {
      const cartDB = await readDB(cartsFilePath);
      const newCart = { _id: uniqid(),...req.body, products: [], total: 0 };
     
      cartDB.push(newCart);
      await writeDB(cartsFilePath, cartDB);
      res.status(201).send(cartDB);
    }


  })
 
  router.put("/:cartId/add-to-cart/:productID", async (req, res, next) => {
    try {
        const cartDB = await readDB(cartsFilePath);
    if (cartDB.length > 0) {
      const selectedCart = cartDB.findIndex(
        
        (cart) => cart._id === req.params.cartId
      );
      if (selectedCart !== -1) {
        const productDB = await readDB(productFilePath);
        const selectedProduct = productDB.filter(
          
          (product) => product._id === req.params.productID
        );
        if (selectedProduct.length > 0) {
            cartDB[selectedCart].products.push(selectedProduct[0]);
      
            cartDB[selectedCart].total += selectedProduct[0].price;
          
            await writeDB(cartsFilePath, cartDB);
            res.status(201).send(cartDB);
          } else {
            const err = {};
            err.httpStatusCode = 404;
            err.message = "There is no product with that ID ";
            next(err);
          }
        } else {
          const err = {};
          err.httpStatusCode = 404;
          err.message = "There is no cart with that ID ";
          next(err);
        }
      } else {
        const err = {};
        err.httpStatusCode = 404;
        err.message = "The cart database is empty ";
        next(err);
      }
    } catch (err) {
      next(err);
    }
  });
  router.delete(
    "/:cartID/remove-from-cart/:productID",
    async (req, res, next) => {
      try {
        const cartDB = await readDB(cartsFilePath);
        if (cartDB.length > 0) {
          const selectedCart = cartDB.findIndex(
            (cart) => cart._id === req.params.cartID
          );
          if (selectedCart !== -1) {
            const alteredProducts = cartDB[selectedCart].products.filter(
              (product) => product._id !== req.params.productID
            ); //Getting a copy of the cart products WITHOUT the selected product
            const selectedProduct = cartDB[selectedCart].products.filter(
              (product) => product._id === req.params.productID
            ); //Getting a copy of the cart products WITH ONLY the selected product
            cartDB[selectedCart].products = alteredProducts;
            cartDB[selectedCart].total =
              cartDB[selectedCart].total - selectedProduct[0].price;
            await writeDB(cartsFilePath, cartDB);
            res.status(201).send(cartDB);
          } else {
            const err = {};
            err.httpStatusCode = 404;
            err.message = "There is no cart with that ID ";
            next(err);
          }
        } else {
          const err = {};
          err.httpStatusCode = 404;
          err.message = "The cart database is empty ";
          next(err);
        }
      } catch (err) {
        next(err);
      }
    }
  );
  module.exports=router