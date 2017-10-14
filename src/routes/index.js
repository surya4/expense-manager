let express = require('express');
let Index = require('../controllers/index');
let router = express.Router();

router.get('/', Index.index_get);

module.exports = router;