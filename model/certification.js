const  mongoose = require('mongoose');

const schema = mongoose.Schema;

const certSchema = new  schema({
    SEQN: Number,
    STUDENT_ID:Number
});

const cert = mongoose.model('certification', certSchema);

module.exports= cert;