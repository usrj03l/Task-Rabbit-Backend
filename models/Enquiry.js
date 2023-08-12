const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    providerUid:String,
    enquiredUser: [
        {
            userUid:String,
            name:String,
            email:String,
            phone:Number          
        }
    ]
});

const Enquiry = mongoose.model('enquiry',enquirySchema);

module.exports = Enquiry;