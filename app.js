const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/routes.js');
const app = express();
const pug = require('pug');
const path = require('path');

app.use(express.static('public'));
app.set('view engine', 'pug');
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(routes)


app.listen(3000);
