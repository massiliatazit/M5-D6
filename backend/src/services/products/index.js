const express = require("express")
const multer = require("multer")
//const fs = require("fs")
const { writeFile, createReadStream } = require("fs-extra")
const path = require("path")
const uniqid = require("uniqid")
const { readDB, writeDB } = require("../lib/utilities")
const { check, validationResult } = require("express-validator")
const upload = multer({})

const router = express.Router()
const productsFolderPath = path.join(__dirname, "../../../public/img/products")

const productsFilePath = path.join(__dirname, "product.json")

// FOR GETTING ALL PROJECTS
router.get("/", async(req, res,next) => {
 try{
const productsDB =  await readDB(productsFilePath )
  res.send(productsDB)}
  catch(error){next(error)}
})
/// getting project with an id
  router.get("/:id", async (req, res,next) => {
    try{
  const productsDB = await readDB(productsFilePath )
  const products= productsDB.filter(product=> String(product._id) === req.params.id)
      if (products.length>0){res.send(products)}
      else {
        const err = new Error()
        err.httpStatusCode = 404
        next(err)
      }
  }
  catch(error){
    next(error)
  }
})

/// uploading image by id

router.post("/:id/upload", upload.single("image"), async (req, res,next) => {
  try{
    
    await writeFile(
      path.join(productsFolderPath, req.params.id + ".jpg"),
      req.file.buffer
      )
      //read json
      //update product ımageUrl wıth 
      

     const productsDB = await readDB(productsFilePath )
     const updated = productsDB.map(product => String(product._id)===req.params.id ? {...product,updatedAt: new Date(), imageUrl: req.params.id + ".jpg"}: product)
    
     await writeDB(productsFilePath ,updated )
     res.send("ok")
   

     
}
catch(error){
  console.log(error)
  next(error)
}
})


/// getting products with specific query 
router.get("/", async(req, res,next) => {
  try{ 
      const productsDB =  await readDB(productsFilePath )
      if (req.query && req.query.name) {
        const filteredproductss = productsDB.filter(
          products =>
            products.hasOwnProperty("name") &&
            products.name.toLowerCase() === req.query.name.toLowerCase()
        )
        res.send(filteredproductss)
      } else {
        res.send(productsDB)
  }}
    catch(error){
      next(error)
    }
})

///POSTING NEW products
router.post("/", 
[
  check("name")
    .isLength({ min: 2 })
    .withMessage("Name should be more than 2 letters")
    .exists() ///What does this mean???
    .withMessage("Insert a name!"),
],

[
  check("price")
    .isNumeric()
    .withMessage("price should be numeric!")
    .exists() ///What does this mean???
    .withMessage("add your student Id!"),
],
async (req, res, next) => {
  
      try{
       
          const errors = validationResult(req)
    
          if (!errors.isEmpty()) {
            const err = new Error()
            err.message = errors
            err.httpStatusCode = 400
            next(err)
          } else {
            const productsDB =  await readDB(productsFilePath )
            const newproducts = {
              ...req.body,
              _id: uniqid(),
              createdAt: new Date(),
              imageUrl: ``

            }
            productsDB.push(newproducts)
            await writeDB(productsFilePath ,productsDB )
            res.status(201).send(newproducts)
            //res.status(201).send({ id: newproducts.ID })
            
           
          }
        } 
        
    catch(error){
      console.log(error)
      next(error)
    }
  
})

///EDITIN' BY ID
router.put("/:id", async (req, res, next) => {
  try
  {
    const productsDB = await readDB(productsFilePath )
  const products = productsDB.filter(products => String(products._id) !== req.params.id)


  const modifiedUser = {
    ...req.body,
    _id: req.params.id,
    updatedAt: new Date(),
  }

  products.push(modifiedUser)
  await writeDB(productsFilePath ,products )
  

  res.send({ id: modifiedUser._id})}
  catch(error){
    next(error)
  }
  
})
///DELETING BY ID
router.delete("/:id", async (req, res, next) => {
  try {
    const productsDB = await readDB(productsFilePath )
    const products  = productsDB.filter(products => products._id !== req.params.id)
    await writeDB(productsFilePath ,products  )

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})


module.exports = router