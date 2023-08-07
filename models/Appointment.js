const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    uid: String,
    userDetails: [
        {
            userUid: String,
            name: String,
            booked: Boolean,
            time: String,
            address: String,
            completed:Boolean,
            canceled:Boolean
        }
    ]
})

const Appointment = mongoose.model('appointment', appointmentSchema);

module.exports = Appointment;