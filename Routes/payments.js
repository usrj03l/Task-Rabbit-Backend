const express = require('express');
const router = express.Router();
const Appointment = require('../models/Payment');
const Payment = require('../models/Payment');

router
    .post('/addTransaction', async (req, res) => {
        const providerData = req.body.providerData;
        const billData = req.body.generatedBill;
        try {
            const existingBill = await Payment.findOne({ providerUid: providerData.uid }).orFail();
            const billIndex = existingBill.bill.findIndex(entry => entry.userUid === billData.userUid);
            existingBill.bill.push(billData);
            existingBill.save();
            return res.status(200).json('success');
        } catch (err) {
            new Payment({
                providerUid: providerData.uid,
                orgName: providerData.orgName,
                bill: [billData]
            }).save();
            res.status(200).json('success')
        }
    })

module.exports = router;