const { Router } = require('express');
const pub = require('../controllers/publicController');

const r = Router();
r.get('/grounds', pub.listGrounds);
r.get('/products', pub.listProducts);

module.exports = r;
