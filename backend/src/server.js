const express = require("express");
const cors = require("cors");
const ListEndPoints = require("express-list-endpoints");
const { join } = require("path");
const ProductRouter = require("./services/products");

const ReviewsRouter = require("./services/reviews");
const CartsRouter = require("./services/carts")
const {
  notFoundHandler,
  unauthorizedHandler,
  forbiddenHandler,
  badRequestHandler,
  catchAllHandler,
} = require("./errorHandling.js");

const server = express();
const port = process.env.PORT || 4001;

server.use(express.json());
server.use(cors());
server.use("/carts",CartsRouter)
server.use("/products", ProductRouter);

server.use("/reviews", ReviewsRouter);

console.log(ListEndPoints(server));
server.use(notFoundHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(badRequestHandler);
server.use(catchAllHandler);

server.listen(port, () => {
  console.log("port is : ", port);
});
