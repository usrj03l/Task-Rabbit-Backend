const mongoose = require('mongoose');

const orgSchema = new mongoose.Schema({
    totalRating:Number,
    totalRatingCount:Number,
    openTime:String,
    closeTime:String,
    reviews:[
        {
            uid:String,
            time:String,
            userRating:Number,
            review:String
        }
    ],
    aboutUs:[
        {
            title:String,
            content:String
        }
    ],
    fQuestions:[
        {
            question:String,
            answer:String
        }
    ]
});

const serviceSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    phone: Number,
    pan: String,
    aadhar: String,
    city: String,
    state: String,
    uid: String,
    expCertificate: String,
    serviceType: String,
    socketId: String,
    profilePic: String,
    orgName: String,
    bio:String,
    orgDetails: orgSchema,
    establishmentYear:String,
    approval:Boolean
});


const Service = mongoose.model('service', serviceSchema);

module.exports = Service;