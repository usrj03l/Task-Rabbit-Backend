const mongoose = require('mongoose');

const catagorySchema = new mongoose.Schema({
    user:String,
    states:[],
    jobTypes:[]
});

const Catagory = mongoose.model('catagory',catagorySchema);

module.exports = Catagory;