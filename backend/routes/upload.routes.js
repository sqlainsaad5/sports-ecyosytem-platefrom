const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const up = require('../controllers/uploadController');

const r = Router();
r.use(authenticate);
r.post('/document', upload.single('file'), up.uploadSingle);
r.post('/image', upload.single('file'), up.uploadSingle);

module.exports = r;
