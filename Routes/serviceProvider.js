const express = require('express');
const router = express.Router();

const Service = require('../models/Service');
const Enquiry = require('../models/Enquiry');
const upload = require('../models/multer');
router
    .get('/getUser/:id', async (req, res) => {
        const id = req.params.id;
        res.send(await Service.findOne({ uid: id }));
    })
    .get('/enquiries', async (req, res) => {
        const uid = req.query.id;
        res.send(await Enquiry.findOne({ providerUid: uid }));
    })
    .post('/deleteEnquiry', async (req, res) => {
        const deleteObj = req.body.deleteObj;
        const newDoc = await Enquiry.findOne({ providerUid: deleteObj.providerUid });
        index = newDoc.enquiredUser.findIndex(user => user.userUid === deleteObj.userUid);
        if (index !== -1) {
            newDoc.enquiredUser.splice(index, 1);
            newDoc.save();
            res.send(newDoc);
        } else {
            res.send(newDoc);
        }
    })
    .get('/search', async (req, res) => {
        const { q, state, serviceType } = req.query;
        const pipeline = [];

        if (q) {
            const regex = new RegExp(q, 'i');
            pipeline.push({
                $match: {
                    $or: [
                        { orgName: regex },
                        { fname: regex },
                        { lname: regex },
                        { city: regex }
                    ]
                }
            });
        }

        if (state) {
            console.log(state);
            const regex = new RegExp(state, 'i')
            pipeline.push({
                $match: {
                    state: regex
                }
            });
        }

        if (serviceType) {
            const regex = new RegExp(serviceType, 'i')
            pipeline.push({
                $match: {
                    serviceType: regex
                }
            });
        }

        if (pipeline.length > 0) {
            const providers = await Service.aggregate(pipeline);
            res.send(providers);
        } else {
            res.json('No docs');
        }
    })
    .post('/getUsersList', async (req, res) => {
        const providers = req.body.users;
        res.send(await Service.find({ uid: providers }));
    })
    .post('/add', upload.single('image'), async (req, res) => {
        const { fname, lname, email, phone, pan, aadhar, city, state, uid, serviceType, orgName } = req.body;
        const imageFile = req.file.path;
        const doc = new Service({
            fname,
            lname,
            email,
            phone,
            pan,
            aadhar,
            city,
            state,
            uid,
            expCertificate: imageFile,
            serviceType,
            socketId: '',
            orgName,
            approval: false,
            userType: 'provider',
            disabled:false
        })
        await doc.save();
        // res.status(200).json({ message: 'Form submitted successfully' });
        res.send(doc.toObject({getters:true}));
    })
    .post('/editProfile', async (req, res) => {
        const id = req.body.id;
        const filteredData = Object.fromEntries(
            Object.entries(req.body.data).filter(([key, value]) => {
                return !Array.isArray(value) && value !== null && value !== '';
            })
        );

        const orgData = Object.fromEntries(
            Object.entries(req.body.data).filter(([key, value]) => {
                return (Array.isArray(value) && value.length > 0);
            })
        );

        const { openTime, closeTime, ...data } = filteredData
        const { aboutUs, fQues } = orgData
        updateObject = {
            $set: data,
            'orgDetails.openTime': openTime,
            'orgDetails.closeTime': closeTime,
        }

        const pushOperations = [];
        if (aboutUs && aboutUs.length > 0) {
            pushOperations.push({ 'orgDetails.aboutUs': { $each: aboutUs } });
        }

        if (fQues && fQues.length > 0) {
            pushOperations.push({ 'orgDetails.fQuestions': { $each: fQues } });
        }

        if (pushOperations.length > 0) {
            updateObject.$push = pushOperations.reduce((acc, curr) => Object.assign(acc, curr), {});
        }

        await Service.findOneAndUpdate({ uid: id }, updateObject, { new: true })
    })
    .post('/setSocket', async (req, res) => {
        const uid = req.body.id
        const socId = req.body.soc;
        await Service.findOneAndUpdate({ uid: uid }, { $set: { socketId: socId } });
        return res.json('success');
    })
    .post('/removeSocket', async (req, res) => {
        const uid = req.body.uid;
        await Service.findOneAndUpdate({ uid: uid }, { $set: { socketId: '' } });
    })
    .post('/profilePic', upload.single('image'), async (req, res) => {
        const { uid } = req.body;
        const newProfilePic = req.file.path.split('\\').pop();
        const doc = await Service.findOneAndUpdate({ uid: uid }, { profilePic: newProfilePic }, { returnDocument: 'after' });
        res.json(doc.profilePic);
    })
    .post('/setBio', async (req, res) => {
        const { bio, uid } = req.body;
        const doc = await Service.findOneAndUpdate({ uid: uid }, { bio: bio });
    });

async function getUserSocket(uid) {
    const serviceProvider = await Service.find({ uid: uid })
    return serviceProvider[0].socketId;
}

module.exports = {
    route: router,
    getUserSocket: getUserSocket
};