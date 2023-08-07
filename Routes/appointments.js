const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

router
    .post('/bookAppointment', async (req, res) => {
        const uid = req.body.id;
        const userInfo = req.body.appointmentData;
        
        try{
            const existingAppointment = await Appointment.findOne({uid:uid}).orFail();
            const userIndex = existingAppointment.userDetails.findIndex(entry => entry.userUid === userInfo.userUid)

            if(userIndex === -1){
                existingAppointment.userDetails.push(userInfo);
                existingAppointment.save();
            }else{
                return res.status(200).json('pending');
            }
        }catch (error){

            new Appointment({
                uid:uid,
                userDetails:[userInfo]
            }).save();
        }


        return res.status(200).json('success');
    })

module.exports = router