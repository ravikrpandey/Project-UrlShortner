const express = require('express');
const router = express.Router();
const urlController = require('../controller/urlController')

router.post('/url/shorten', urlController.urlShortner )
router.get('/:urlCode', urlController.getUrl)

router.all("/**", function (req,res){
    res.status(404).send({status:false, msg:" API you request is not vailable"})
})

module.exports = router