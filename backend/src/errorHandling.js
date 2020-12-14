const notFoundHandler = (err, req, res, next) => {
    if (err.httpStatusCode === 404) {
      res.status(404).send("Not Found!");
    }
    next(err);
  };
  
  const unauthorizedHandler = (err, req, res, next) => {
    if (err.httpStatusCode === 401) {
      res.status(401).send("Go away , you are not authourized for this dude.");
    }
    next(err);
  };
  
  const forbiddenHandler = (err, req, res, next) => {
    if (err.httpStatusCode === 403) {
      res.status(403).send("Bad Bad request");
    }
    next(err);
  };
  
  const badRequestHandler = (err, req, res, next) => {
    if (err.httpStatusCode === 400) {
      res.status(400).send(err.message);
    }
    next(err);
  };
  
  const catchAllHandler = (err, req, res, next) => {
    console.log(err)
    if (!res.headersSent) {
      res.status(500).send("server is going down");
    }
  };
  
  module.exports = {
    notFoundHandler,
    unauthorizedHandler,
    forbiddenHandler,
    badRequestHandler,
    catchAllHandler,
  };