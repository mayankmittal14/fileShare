require('dotenv').config();

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const {v4:uuid} = require('uuid');
const { response } = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `M14_${Date.now()}_${Math.round(Math.random()*1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
})

let upload = multer({
    storage,
    limit: {
        fileSize: 1E8                   //100 MB
    }
}).single('uploaded_file');

router.post('/', (req, res) => {
    upload(req, res, async (err) => {
        if(!req.file){
            return res.json({Error: "All fields are required."});
        }
    
        if(err){
            return res.status(500).send({ Error: err.message });
        }

        const file = new File({
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            uuid: uuid()
        });

        await file.save();
        return res.json({ file: `${process.env.APP_URL}/files/M_14/${file.uuid}`});
    })
});

const realEmailAPIKey = process.env.REALEMAIL_API_KEY;

function validate(email_address){
    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if(regex.test(email_address)===false){
        return "invalid";
    }

    fetch("https://isitarealemail.com/api/email/validate?email=" + 
        email_address,
        {
            crossDomain: true,
            headers:{
                Authorization: "Bearer " + realEmailAPIKey
            }
        })
        .then(function responseHandler(data){
            if(data.status === "valid"){
                return "valid";
            }
            else{
                return "invalid";
            }
        });
}

router.post('/send', async (req, res) => {
    const { emailFrom, emailTo, uuid } = req.body;
    
    if(!emailFrom || !emailTo || !uuid){
        return res.status(422).send({ Error: "All fields are required" });
    }
    else
    if(emailFrom===emailTo){
        return res.status(422).send({ Error: "Email ID of sender and receiver should be different" });
    }
    else
    if(validate(emailTo) === "invalid"){
        return res.status(422).send({ Error: "Invalid Receiver" });
    }
    else
    if(validate(emailFrom) === "invalid"){
        return res.status(422).send({ Error: "Invalid Sender" });
    }
    
    const file = await File.findOne({ uuid });
    if(file.sender){
        return res.status(422).send({ Error: "Email already sent." })
    }

    file.sender = emailFrom;
    file.receiver = emailTo;
    await file.save();

    const sendMail = require('../services/emailService');
    sendMail({
        from: emailFrom,
        to: emailTo,
        subject: "fileShare - Share Files Easily",
        text: `${emailFrom} shared a file with you`,
        html: require('../services/emailTemplate')({
            email_from: emailFrom,
            file_download: `${process.env.APP_URL}/files/M_14/${file.uuid}`,
            file_size: parseFloat(file.size/1e6).toFixed(2)
        })
    });

    return res.send({ Success: "Email sent successfully" });
});

module.exports = router;