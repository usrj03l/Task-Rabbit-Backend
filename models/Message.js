const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: String,
    date: String,
    time: String,
    messageType: String
})

const messageListSchema = new mongoose.Schema({
    uid: String,
    messages: [
        {
            receiverUid: String,
            messageList: [messageSchema]

        }
    ]
})

const Message = mongoose.model('message', messageListSchema);

module.exports = Message;