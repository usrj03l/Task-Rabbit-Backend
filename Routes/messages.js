const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router
    .post('/getMessages', async (req, res) => {
        const uid = req.body.uid;
        res.send(await Message.findOne({ uid: uid }));
    });

async function setMessage(sender, recipient, message, messageType) {
    const dateTime = new Date()
    const date = dateTime.toLocaleString('default', { month: 'long', day: '2-digit' });
    const time = dateTime.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

    const msg = {
        message: message,
        date: date,
        time: time,
        messageType: messageType
    }

    try {
        const existingMessageList = await Message.findOne({ uid: sender }).orFail();
        const receiverIndex = existingMessageList.messages.findIndex(entry => entry.receiverUid === recipient)

        if (receiverIndex !== -1) {
            existingMessageList.messages[receiverIndex].messageList.push(msg);
        } else {
            existingMessageList.messages.push({
                receiverUid: recipient,
                messageList: [msg]
            });
        }
        existingMessageList.save();
    } catch (err) {
        new Message({
            uid: sender,
            messages:
            {
                receiverUid: recipient,
                messageList: [msg]
            }
        }).save();
    }
}

module.exports = {
    route: router,
    setMessage: setMessage
}
