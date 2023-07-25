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
    image: String
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
router.post('/add', upload.single('image'), (req, res) => {
    const { fname, lname, email, phone, pan, aadhar, city, state, uid } = req.body;
    const imageFile = req.file.path;
    console.log(typeof (imageFile));
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
        image: imageFile
    }).save();

    res.status(200).json({ message: 'Form submitted successfully' });
});



module.exports = router;