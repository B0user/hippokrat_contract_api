const express = require('express');
const router = express.Router();
const spravkaController = require('../../controllers/spravkaController');

router.post('/', spravkaController.createSpravka);
router.get('/', spravkaController.getAllSpravkas);

module.exports = router;