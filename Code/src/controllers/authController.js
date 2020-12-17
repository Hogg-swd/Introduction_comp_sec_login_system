const sha256 = require('js-sha256');
const mysql = require("mysql");
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
var jwt = require('jsonwebtoken');

//read things from env

dotenv.config({path: './.env'});

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

db.connect((error) => {
    if(error){
      console.log(error);
      console.log("it has failed me");
    } else {
      console.log("connect to database");
    }
  });


exports.register = (req, res) => {
  pwpat = /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]+$/

  console.log(req.body.email);
  pwhash = sha256(req.body.password);
  ehash = sha256(req.body.email);
  var name = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
  var validpassword = pwpat.test(password);

  var re = /\S+@\S+\.\S+/;
  var validmail = re.test(email);

  console.log(password.length)

  if(password.length < 7 || !validpassword || !validmail){
    res.render('register');
  } else {
    db.query('INSERT INTO users set ?', {user_name : name, email : ehash, passwd : pwhash}, (err, response) => {
        if(err){
          console.log(err);
          res.render('register');
        } else {
          res.render('login');
        }
      });
  }
}

exports.update = (req, res) => {
  pwpat = /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]+$/

  var name = req.body.email;
  var newPw = req.body.newpassword;
  var password = req.body.oldpassword;
  var email = req.body.email;
  var quote = '\'';
  ehash = sha256(email);
  ehash = quote + ehash + quote;
  hash = sha256(password);
  newHash = sha256(newPw);
  newHash = quote + newHash + quote;
  hash = quote + hash + quote;
  var validpassword = pwpat.test(password);

  sql = 'UPDATE users SET passwd =' +  newHash + ' WHERE email = ' + ehash +'AND passwd = ' + hash + ';';

  if(newPw.length < 7 || !validpassword){
    res.render('update');
  } else {
    db.query(sql, (err, response) => {
      if(err){
        console.log(err);
        res.render('update');
      } else {
        if(response.affectedRows > 0){
          res.clearCookie('jwt');
          res.render('login');
        } else {
          res.render('update');
        }
      }
    });
  }
}

exports.login = function(req, res, next){
  hash = sha256(req.body.password);
  var password = req.body.password;
  var email = req.body.email;
  quote = '\''
  ehash = sha256(req.body.email);
  ehash = quote + ehash + quote;

  db.query('SELECT uid, user_name, email, passwd FROM users WHERE email = ' + ehash + 'AND passwd =' + quote + hash + quote, (err, response) => {
    if(err){
      res.render("login");
    } else {
      if(response.length > 0){
          let payload = {username: response[0].user_name}
          //create the access token with the shorter lifespan
          let accessToken = jwt.sign(payload,
          process.env.ACCESS_TOKEN_SECRET, { algorithm: "HS256", expiresIn:
          process.env.ACCESS_TOKEN_LIFE})

   //create the refresh token with the longer lifespan
    let refreshToken = jwt.sign(payload, 'dhw782wujnd99ahmmakhanjkajikhiwn2n', {
       algorithm: "HS256",
       expiresIn: 10000000000
     })

   //send the access token to the client inside a cookie
    res.cookie("jwt", accessToken, {secure: true, http : true})
    res.render('dashboard');

    console.log(accessToken);

        //if password match call this
      } else {
        res.render("login");
      }
    }
  });

  exports.refresh = function (req, res){

    let accessToken = req.cookies.jwt

    if (!accessToken){
        return res.status(403).send()
    }

    let payload
    try{
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
     }
    catch(e){
        return res.status(401).send()
    }

    //retrieve the refresh token from the users array
    let refreshToken = users[payload.username].refreshToken

    //verify the refresh token
    try{
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    }
    catch(e){
        return res.status(401).send()
    }

    let newToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,
    {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_LIFE
    })

    res.cookie("jwt", newToken, {secure: true, httpOnly: true})
    res.send()
}

}
