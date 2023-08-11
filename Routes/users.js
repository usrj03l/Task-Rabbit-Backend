const express = require('express');
const router = express.Router();

const upload = require('../models/multer');
const User = require('../models/User');
const Message = require('../models/Message');

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
    .post('/profilePic', upload.single('image'), async (req, res) => {
        console.log('1');
        const { uid } = req.body;
        const newProfilePic = req.file.path.split('\\').pop();
        const doc = await User.findOneAndUpdate({ uid: uid }, { profilePic: newProfilePic }, { new: true });
        res.send(doc);
    })

async function getUserSocket(uid) {
    const user = await User.find({ uid: uid })
    return user[0].socketId;
}

module.exports = {
    route: router,
    getUserSocket: getUserSocket
}
