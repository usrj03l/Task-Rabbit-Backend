const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

router
    .get('/getAppointments', async (req, res) => {
        const uid = req.query.id;
        const userUid = req.query.userUid;
        let appointmentsData;

        if (userUid) {
            try {
                const appointmentsData = await Appointment.aggregate([
                    {
                        $match: { "userDetails.userUid": userUid }
                    },
                    {
                        $project: {
                            uid: 1,
                            providerName: 1,
                            userDetails: {
                                $filter: {
                                    input: '$userDetails',
                                    as: 'userDetail',
                                    cond: { $eq: ['$$userDetail.userUid', userUid] } 
                                }
                            }
                        }
                    }
                ]);
                if (appointmentsData.length > 0) {
                    return res.send(appointmentsData);
                } else {
                    return res.send(null);
                }
            } catch (error) {
                console.error(error);
                return res.status(500).send('Internal Server Error');
            }
        } else {
            appointmentsData = await Appointment.findOne({ uid: uid });
        }

        if (appointmentsData) {
            return res.send(appointmentsData);
        } else {
            return res.send(null);
        }

    })
    .post('/bookAppointment', async (req, res) => {
        const uid = req.body.id;
        const { providerName, ...userInfo } = req.body.appointmentData;

        try {
            const existingAppointment = await Appointment.findOne({ uid: uid }).orFail();
            const userIndex = existingAppointment.userDetails.findIndex(entry => entry.userUid === userInfo.userUid);

            if (userIndex === -1 || existingAppointment.userDetails[userIndex].completed) {
                existingAppointment.userDetails.push(userInfo);
                existingAppointment.save();
                return res.status(200).json('success');
            }else{
                return res.status(200).json('pending');
            }

        } catch (error) {

            new Appointment({
                uid: uid,
                providerName: providerName,
                userDetails: [userInfo]
            }).save();
        }
        return res.status(200).json('success');
    })
    .post('/editAppointment', async (req, res) => {
        const uid = req.body.id;
        const updateObj = req.body.data;
        const userUid = req.body.userUid;
        const docId = req.body.docId;

        const existingAppointment = await Appointment.findOne({ uid: uid });
        const userIndex = existingAppointment.userDetails.findIndex(entry => entry._id.equals(docId));

        if (Object.keys(updateObj)[0] === 'booked') {
            existingAppointment.userDetails[userIndex].booked = Object.values(updateObj)[0];
        } 
        if(Object.keys(updateObj)[0] === 'cancelled'){
            existingAppointment.userDetails[userIndex].cancelled = Object.values(updateObj)[0];
        }
        if(Object.keys(updateObj)[0] === 'completed'){
            existingAppointment.userDetails[userIndex].completed = Object.values(updateObj)[0];
        }
        existingAppointment.save();
    });

module.exports = router