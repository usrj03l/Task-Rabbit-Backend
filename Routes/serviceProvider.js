const mongoose = require('mongoose');
const express = require('express');
const multer = require('multer');
const router = express.Router();


const serviceSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    phone: Number,
    pan: String,
    aadhar: String,
    city: String,
    state: String,
    uid: String,
    expCertificate: String,
    serviceType: String,
    socketId: String,
    profilePic: String,
    bio: String
});

const Service = mongoose.model('service', serviceSchema);

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/provider");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `files/admin-${file.fieldname}-${Date.now()}.${ext}`);
    },
});

const upload = multer({ storage: multerStorage });

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
        }else{
            res.json('No docs');
        }



    })
    .post('/add', upload.single('image'), (req, res) => {
        const { fname, lname, email, phone, pan, aadhar, city, state, uid, serviceType } = req.body;
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
            socketId: ''
        }).save();

        res.status(200).json({ message: 'Form submitted successfully' });
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