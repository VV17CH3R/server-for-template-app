const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require("bcrypt");
const { validateToken } = require('../middlewares/AuthMiddleware')

const {sign} = require('jsonwebtoken');

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    Users.create({
      username: username,
      password: hash,
    });
    res.json("SUCCESS");
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await Users.findOne({ where: { username: username } });
  if (!user) return res.json({ error: "User Doesn't Exist" });
  try {
    bcrypt.compare(password, user.password).then(async (match) => {
        if (!match) return res.json({ error: "Wrong Username And Password Combination" });
        const accessToken = sign(
          { username: user.username, id: user.id },
          "importantsecret"
        );
        return res.json({token: accessToken, username: username, id: user.id});
      });
    } catch(err) {
    console.log("showing errors" , err);
    }
});



router.get('/auth', validateToken ,(req, res) => {
  res.json(req.user);
});


module.exports = router;
