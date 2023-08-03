const express = require('express');
const router = express.Router();

const Service = require('../models/Service');
const upload = require('../models/multer');
const User = require('../models/User');

router
    .get('/getUser/:id', async (req, res) => {
        const id = req.params.id;
        res.send(await Service.findOne({ uid: id }));
    })
    .get('/search', async (req, res) => {
        const { q, city, serviceType } = req.query;
        const pipeline = [];

        if (q) {
            const regex = new RegExp(q, 'i');
            pipeline.push({
                $match: {
                    $or: [
                        { orgName: regex },
                        { fname: regex },
                        { lname: regex }
                    ]
                }
            });
        }

        if (city) {
            const regex = new RegExp(city, 'i')
            pipeline.push({
                $match: {
                    city: regex
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
    .post('/add', upload.single('image'), (req, res) => {
        const { fname, lname, email, phone, pan, aadhar, city, state, uid, serviceType, orgName } = req.body;
        const imageFile = req.file.path;
        new Service({
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
            approval: false
        }).save();
        res.status(200).json({ message: 'Form submitted successfully' });
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
            .then(data => console.log(data))
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
        const newProfilePic = req.file.path;
        const doc = await Service.findOneAndUpdate({ uid: uid }, { profilePic: newProfilePic }, { returnDocument: 'after' });
        res.json(doc.profilePic.split('\\').pop());
    })
    .post('/setBio', async (req, res) => {
        const { bio, uid } = req.body;
        const doc = await Service.findOneAndUpdate({ uid: uid }, { bio: bio });
    })

module.exports = router;