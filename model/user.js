const mongoose = require('mongoose');


const schema = mongoose.Schema;

var userSchema = new schema({
    Id:Number,
    FIRST_NAME:String,
    CHAPTER:String
});

var user= mongoose.model('user',userSchema);

module.exports=user;