const express = require("express");
const seedRoutes = express.Router();
let jwt = require("jsonwebtoken");
let Seed = require("./seedSchema");
let User = require("./userSchema");
const bcrypt = require('bcrypt');


seedRoutes.route("/login").post((req, res) => {
  loginManage(req, res)
})

seedRoutes.use((req, res, next) => {
  console.log(req.headers.authorization);
  let token = req.headers.authorization.split(" ")[1];
  console.log("token" + token);
  if (token) {
    jwt.verify(token, "superSecret", (err, decoded) => {
      if (err) {
        return res.json({
          status: 403,
          success: false,
          message: "Failed to authenticate token."
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.json({
      status: 403,
      success: false,
      message: "No token provided."
    });
  }
});

seedRoutes.route("/add").post((req, res) => {
  console.log(req.body);
  let seed = new Seed({
    page: req.body.page,
    isSpa: req.body.isSpa,
    method: req.body.method,
    numberOfChildren: req.body.numberOfChildren
  });
  seed
    .save()
    .then(() => {
      console.log("saved!");
      res.status(200).send("saved!");
    })
    .catch(error => {
      console.log(error);
      res.status(400).send(error);
    });
});

seedRoutes.route("/fetchAll").get((req, res) => {
  Seed.find({}, "page _id isSpa method numberOfChildren")
    .then(seeds => {
      res.status(200).send(seeds);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

seedRoutes.route("/removeSeeds").post((req, res) => {
  console.log("body: " + JSON.stringify(req.body));
  Seed.deleteMany({ _id: req.body })
    .then(result => {
      res.status(200).send(result);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

async function loginManage(req, res){
  try {
    const saltRounds = 10;
    hash = await bcrypt.hash(req.body.password, saltRounds)
    user = await User.findOne({ username: req.body.username})
    if(user.length > 0){
      hashMatches = await bcrypt.compare(user.password, hash)
    }
    if(user.length > 0 && hashMatches){
      const payload = {
        username: user.username
      };
      let token = jwt.sign(payload, "superSecret", {
        expiresIn: 60 * 60 * 24 // expires in 24 hours
      })
      res.status(200).json({
        message: "OK",
        token: token
      })
    } else {
      res.status(401).send({ message: "Invalid Credentials" });
    }
  } catch (err) {
    res.send(500).json({message: 'A Server Error Occured!'})
  }
}
module.exports = seedRoutes;
