require('dotenv').config();
const express = require('express');
const router = express.Router();
const File = require('../models/file');

router.get('/:uuid', async (req, res) => {
    try{
        const file = await File.findOne({ uuid: req.params.uuid });
        if(!file){
             return res.render('download', { Error: "Link has been expired."});
        }

        return res.render('download', {
            file_name: file.filename,
            file_size: file.size,
            file_uuid: file.uuid,
            file_download: `${process.env.APP_URL}/files/download/${file.uuid}`
        });
    }
    catch(err){
        return res.render('download', { Error: "Something went wrong. Please try again."});
    }
});

module.exports = router;