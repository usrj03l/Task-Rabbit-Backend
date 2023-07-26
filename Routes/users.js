const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();


const userSchema = new mongoose.Schema({
    uid: String,
    fname: String,
    lanme: String,
    email: String,
    phone: Number,
    street: String,
    street2: String,
    city: String,
    state: String,
    zip: Number,
    socketId: String
});

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

const User = mongoose.model('user', userSchema);
const Message = mongoose.model('message', messageListSchema);

router
    .get('/:id', async (req, res) => {
        const id = req.params.id;
        res.send(await User.exists({ uid: id }))
    })
    .post('/getUsers', async (req, res) => {
        const users = req.body.users;
        res.send(await User.find({ uid: users }));
    })
    .post('/add', async (req, res) => {
        const data = req.body;
        await new User(data)
            .save();
        return res.json('200');
    })
    .post('/setSocket', async (req, res) => {
        const uid = req.body.id
        const socId = req.body.soc;
        await User.findOneAndUpdate({ uid: uid }, { $set: { socketId: socId } });
        return res.json('success');
    })
    .post('/removeSocket', async (req, res) => {
        const uid = req.body.uid;
        await User.findOneAndUpdate({ uid: uid }, { $set: { socketId: '' } });
    })
    .post('/getMessages', async (req, res) => {
        const uid = req.body.uid;
        res.send(await Message.findOne({ uid: uid }));
    })


async function getUser(uid) {
    let recipientSocketId;
    const user = await User.find({ uid: uid })
    return user[0].socketId;
}

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

        const existingList = await Message.findOne({ uid: sender }).orFail();

        const receiverIndex = existingList.messages.findIndex(entry => entry.receiverUid === recipient)

        if (receiverIndex !== -1) {
            existingList.messages[receiverIndex].messageList.push(msg);
        } else {
            existingList.messages.push({
                receiverUid: recipient,
                messageList: [msg]
            });
        }

        existingList.save();

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
    getUser: getUser,
    setMessage: setMessage
}
