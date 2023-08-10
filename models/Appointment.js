const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    uid: String,
    providerName:String,
    userDetails: [
        {
            userUid: String,
            name: String,
            profilePic: String,
            booked: Boolean,
            date: String,
            time: String,
            address: String,
            phone:Number,
            email:String,
            completed: Boolean,
            cancelled: Boolean
        }
    ]
})

const Appointment = mongoose.model('appointment', appointmentSchema);

module.exports = Appointment;