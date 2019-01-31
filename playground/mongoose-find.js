"user strict";

const { User } = require("../server/models/user");



User.findById("5c51dae79a749e0966e07772").exec()
  .then(user => {
    if (!user)
      return console.log("No user found");
    console.log("Found: ", user);
  })
  .catch(e => {
    console.log("Err: ", e.message);
  });
