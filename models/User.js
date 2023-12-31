const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: String,
    fname: String,
    lname: String,
    email: String,
    phone: Number,
    street: String,
    street2: String,
    city: String,
    state: String,
    zip: Number,
    socketId: String,
    profilePic:String,
    userType:String,
    disabled:Boolean
});

const User = mongoose.model('user', userSchema);

module.exports = User;