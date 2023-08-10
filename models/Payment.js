const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    providerUid: String,
    orgName: String,
    bill: [
        {
            userUid: String,
            name: String,
            address: String,
            phone: Number,
            email: String,
            date: String,
            mode: String,
            totalCost: Number,
            itemList: [
                {
                    desc: String,
                    qty: Number,
                    price: Number
                }
            ]

        }
    ]
});

const Payment = mongoose.model('payment', paymentSchema);

module.exports = Payment;