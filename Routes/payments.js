const express = require('express');
const router = express.Router();
const Appointment = require('../models/Payment');
const Payment = require('../models/Payment');

router
    .get('/getBill', async (req, res) => {
        const userUid = req.query.id;
        
        try {
            const appointmentsData = await Appointment.aggregate([
                {
                    $match: { "bill.userUid": userUid }
                },
                {
                    $project: {
                        providerUid: 1,
                        orgName: 1,
                        bill: {
                            $filter: {
                                input: '$bill',
                                as: 'getBill',
                                cond: { $eq: ['$$getBill.userUid', userUid] } 
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

    })
    .get('/getFullTransaction',async(req,res)=>{
        const providerUid = req.query.id;
        const data = await Payment.findOne({providerUid:providerUid});
        if(data){
            res.send(data);
        }else{
            res.send(null);
        }
    })
    .post('/addTransaction', async (req, res) => {
        const providerData = req.body.providerData;
        const billData = req.body.generatedBill;
        try {
            const existingBill = await Payment.findOne({ providerUid: providerData.uid }).orFail();
            existingBill.bill.push(billData);
            existingBill.save();
            return res.status(200).json('success');
        } catch (err) {
            console.log(billData);
            new Payment({
                providerUid: providerData.uid,
                orgName: providerData.orgName,
                bill: [billData]
            }).save();
            res.status(200).json('success')
        }
    })

module.exports = router;