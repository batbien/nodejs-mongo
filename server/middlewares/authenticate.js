const {User} = require("../models/user");

var authenticate = (req, res, next) => {
  var token = req.header("x-auth");
  User.findByToken(token)
    .then(
      user => {
        if (!user)
          return Promise.reject();
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
