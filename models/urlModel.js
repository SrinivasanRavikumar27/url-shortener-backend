const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    urlid : {type : String, required: true},
    url : { type: String, unique : true ,required:true },
    shortUrl : {type : String, unique : true, required:true},
    clicks : {type : Number, default : 0},
    userid : {type : String,required : true},
    createdAt : {type : Date,default : Date.now()},
    updatedAt : {type : Date,default : null}
});

const urlModel = mongoose.model('URL',urlSchema,'urls');

module.exports = urlModel;