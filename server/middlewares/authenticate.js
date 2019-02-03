const { User } = require("../models/user");
const { ObjectID } = require("mongodb");

var authenticate = (req, res, next) => {
  var token = req.header("x-auth");
  
  User.findByToken(token)
    .then(
      user => {
        req.user = user;
        req.token = token;
        next();
      }
    )
    .catch(
      () => { res.status(401).send("Authorization failed"); }
    );
};

module.exports = { authenticate };
