const express = require('express');
const router = express.Router();

const upload = require('../models/multer');
const User = require('../models/User');
const Message = require('../models/Message');
const Enquiry = require('../models/Enquiry');

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
        data.userType = 'user';
        data.disabled = false;
        const doc = new User(data);
        doc.save();
        return res.send(doc.toObject({ getters: true }));
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
    .post('/enquire', async (req, res) => {
        const providerUid = req.body.id;
        const user = req.body.user;

        try {
            existingEnquiryList = await Enquiry.findOne({ providerUid: providerUid }).orFail();
            existingEnquiryList.enquiredUser.push(user);
            res.status(200).json('success');
            existingEnquiryList.save();
        } catch {
            new Enquiry({
                providerUid: providerUid,
                enquiredUser: [user]
            }).save();
            res.status(200).json('success');
        }
    })
    .put('/editProfile', async (req, res) => {
        const uid = req.body.id;
        const filteredData = Object.fromEntries(
            Object.entries(req.body.formData).filter(([key, value]) => {
                return value !== null && value !== '';
            })
        );
        const updateObject = { $set: filteredData }
        await User.findOneAndUpdate({ uid: uid }, updateObject,{new:true});
        res.status(200);
    });

async function getUserSocket(uid) {
    const user = await User.find({ uid: uid })
    return user[0].socketId;
}

module.exports = {
    route: router,
    getUserSocket: getUserSocket
}
