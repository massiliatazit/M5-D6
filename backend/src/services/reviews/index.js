const express = require("express")

const {writeFile}=require("fs-extra")

var fs = require('fs'); 
const uniqid = require("uniqid");

const { readDB, writeDB } = require("../lib/utilities")
const { check, validationResult } = require("express-validator");

const { join } = require("path");
const router = express.Router()
const reviewsFilePath = join(__dirname, "reviews.json")
 const productFilePath = join(__dirname, "../products/product.json")

router.get("/", async (req, res,next) => {
  
    try {
        const reviewsDB = await readDB(reviewsFilePath); 
        if (reviewsDB.length > 0) {
          res.status(201).send(reviewsDB); 
        } else {
          const err = {};
          err.httpStatusCode = 404;
          next(err);
        }
      } catch (err) {
        err.httpStatusCode = 404;
        next(err);
      }
    });


    router.get("/:id", async (req, res, next) => {

      try {
        const reviewsDB = await readDB(reviewsFilePath); 
        const singlereview = reviewsDB.filter(
          (review) => review.elementId === req.params.id
        );
        res.status(200).send(singlereview); 
      } catch (err) {
        err.httpStatusCode = 404;
        next(err);
      }
       /* try {
          console.log("1 ")
          const reviewsDB = await readDB(reviewsFilePath); 
          const singlereview = reviewsDB.filter(
            (review) => review.ID === req.params.id
          );
          if (singlereview.length > 0) {
            res.status(201).send(singlereview); 
          } else {
            const err = {};
            err.httpStatusCode = 404;
            next(err);
          }
        } catch (err) {
          err.httpStatusCode = 404;
          next(err);
        }*/
      });
    
      router.post(
        "/",
        
          check("comment")
            .exists()
            .isLength({ min: 1 })
            .withMessage("Give it a comment please :) "),
          check("rate")
            .exists()
            .isLength({ min: 1 })
            .isInt({min:1,max:5})
            // .custom((val, { req }) => {
            //     console.log('here')
            //     if ( parseInt(req.body.rate) > 5) {
            //       throw new Error('The rate should be max 5');
            //     }
            // })
            .withMessage("You have to rate it at be kind give 5 :D"),
         
          check("elementId")
            .exists()
            .isLength({ min: 1 })
            .custom(async(val,{req})=>{
           
              const productDB = await readDB(productFilePath)
                if(!productDB.find(product=> product._id===req.body.elementId)) {
                    throw new Error("The product id doesn't exists ") 
            }})
            .withMessage("You need to have your product ID"),
        
        async (req, res, next) => {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
              //if elementId is valid product._id
            const err = {};
            err.message = errors;
            err.httpStatusCode = 400;
            next(err);
          } else {
            const reviewsDB = await readDB(reviewsFilePath); 
             const productDB = await readDB(productFilePath)
             console.log("product data",productDB)
             if (productDB.find(product=> product._id===req.body.elementId)) {
                 const newreview = req.body;
            
            newreview.ID = uniqid(); 
           
            newreview.CreationDate = new Date(); 
            reviewsDB.push(newreview); 
             }
            await writeDB(reviewsFilePath, reviewsDB); 
            res.status(201).send(reviewsDB); 
              }


            
          }
        
      );
     
      router.put("/:id", async (req, res, next) => {
        try {
          const reviewsDB = await readDB(reviewsFilePath); 
          const singlereview = reviewsDB.filter(
            (review) => review.ID === req.params.id
          );
          if (singlereview.length > 0) {
            const filteredDB = reviewsDB.filter(
              (review) => review.ID !== req.params.id
            );
            console.log(singlereview);
            const editreviews = {
              ...req.body,
              ID: singlereview[0].ID,
              
              CreationDate: singlereview[0].CreationDate,
              ModifiedDate: new Date(),
            };
            filteredDB.push(editreviews);
            await writeDB(reviewsFilePath, filteredDB);
            res.status(201).send(filteredDB); 
          } else {
            const err = {};
            err.httpStatusCode = 404;
            next(err);
          }
        } catch (err) {
          err.httpStatusCode = 404;
          next(err);
        }
      });
      router.delete("/:id", async (req, res, next) => {
        try {
          const reviewsDB = await readDB(reviewsFilePath); //RUNS FUNCTION TO GET DATABASE
          const singlereview = reviewsDB.filter(
            (review) => review.ID === req.params.id
          );
          if (singlereview.length > 0) {
            const filteredDB = reviewsDB.filter(
              (review) => review.ID !== req.params.id
            );
            await writeDB(reviewsFilePath, filteredDB);
            res.status(201).send(filteredDB); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
          } else {
            const err = {};
            err.httpStatusCode = 404;
            next(err);
          }
        } catch (err) {
          err.httpStatusCode = 404;
          next(err);
        }
      });
      
   
      
      module.exports=router;