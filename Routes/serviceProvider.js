const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const multer = require('multer');

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
    image: String,
    serviceType: String,
    socketId: String
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

// Handle the form submission
router
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
            image: imageFile,
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



module.exports = router;