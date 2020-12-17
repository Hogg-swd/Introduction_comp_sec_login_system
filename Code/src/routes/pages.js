const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/login', (req, res) => {
  res.render('login');
});

const {verify} = require('../controllers/midware');

router.get('/update',  verify, (req, res) => {
  res.render('update');
});

router.get('/dashboard', verify, (req, res) => {
  res.render('dashboard');
});

router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.render('index');
})

//add arg verify and read the request token, before route

module.exports = router;
