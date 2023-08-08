const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

router
    .get('/getAppointments', async (req, res) => {
        const uid = req.query.id;
        const userUid = req.query.userUid;
        let appointmentsData;
        
        if(userUid){
            appointmentsData = await Appointment.find({ "userDetails.userUid": userUid });
        }else{
             appointmentsData = await Appointment.findOne({ uid: uid });
        }

        if (appointmentsData) {
            return res.send(appointmentsData)
        } else {
            return res.send(null);
        }

    })
    .post('/bookAppointment', async (req, res) => {
        const uid = req.body.id;
        const {providerName,...userInfo} = req.body.appointmentData;

        try {
            const existingAppointment = await Appointment.findOne({ uid: uid }).orFail();
            const userIndex = existingAppointment.userDetails.findIndex(entry => entry.userUid === userInfo.userUid)

            if (userIndex === -1) {
                existingAppointment.userDetails.push(userInfo);
                existingAppointment.save();
            } else {
                return res.status(200).json('pending');
            }
        } catch (error) {

            new Appointment({
                uid: uid,
                providerName:providerName,
                userDetails: [userInfo]
            }).save();
        }
        return res.status(200).json('success');
    })
    .post('/editAppointment', async (req, res) => {
        const uid = req.body.id;
        const updateObj = req.body.data;
        const userUid = req.body.userUid;
        
        const existingAppointment = await Appointment.findOne({ uid: uid });
        const userIndex = existingAppointment.userDetails.findIndex(entry => entry.userUid === userUid)

        if(Object.keys(updateObj)[0] === 'booked'){
            existingAppointment.userDetails[userIndex].booked = Object.values(updateObj)[0];
        }else{
            existingAppointment.userDetails[userIndex].cancelled = Object.values(updateObj)[0];
        }
       
        existingAppointment.save();
    })

module.exports = router