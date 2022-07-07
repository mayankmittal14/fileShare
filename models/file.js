const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    filename:{
        type: String,
        required: true
    },
    path:{
        type: String,
        required: true
    },
    size:{
        type: String,
        required: true
    },
    uuid:{
        type: String,
        required: true
    },
    sender: String,
    receiver: String
},
{
    timestamps: true
});

module.exports = mongoose.model('File', fileSchema);