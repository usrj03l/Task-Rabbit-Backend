const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    providerUid:String,
    bill:[
        {
            userUid:String,
            totalCost:Number,
            itemList:{
                    desc:String,
                    qty:Number,
                    price:Number
                }
            
        }
    ]
});

const Payment = mongoose.model('payment',paymentSchema);

module.exports = Payment;