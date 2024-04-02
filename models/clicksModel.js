const mongoose = require('mongoose');

const clicksSchema = new mongoose.Schema({
    urlid : {type : String,required : true},
    userid : {type : String,required : true},
    clicks : {type : Number, default : 0},
    createdAt : {type : Date,default : Date.now()},
    updatedAt : {type : Date,default : null}
});

const  ClicksModel= mongoose.model("Clicks",clicksSchema,'clicks');

module.exports = ClicksModel;