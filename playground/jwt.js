const jwt = require("jsonwebtoken");

var signed = jwt.sign("foo", "bar");
console.log(signed);
