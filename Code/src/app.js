const express = require("express");
const mysql = require("mysql");
const path = require("path")
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const sha256 = require('js-sha256');
const cookieParser = require('cookie-parser')

dotenv.config({path: './.env'});

const app = express();

app.set('view engine', 'hbs');

const pubDir = path.join(__dirname, './pub');
app.use(express.static(pubDir));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cookieParser());

//Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
