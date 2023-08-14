const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Service = require('../models/Service');

router
    .get('/users', async (req, res) => {
        search = req.query.searchText;
        const regex = new RegExp(search, 'i');
        searchObj = [{
            $match: {
                $or: [
                    { fname: regex },
                    { lname: regex },
                    { email: regex },
                ]
            }
        }]

        const users = await User.aggregate(searchObj)
        if (users) {
            res.send(users);
        }
    })
    .get('/providers', async (req, res) => {
        search = req.query.searchText;
        const regex = new RegExp(search, 'i');
        searchObj = [{
            $match: {
                $or: [
                    { fname: regex },
                    { lname: regex },
                    { email: regex },
                    { orgName: regex },
                ]
            }
        }]

        const providers = await Service.aggregate(searchObj)
        if (providers) {
            res.send(providers);
        }
    })
    .put('/user', async (req, res) => {
        const uid = req.body.uid;
        const doc = await User.findOne({ uid: uid });
        doc.disabled = !doc.disabled;
        doc.save();
        res.send('success');
    })
    .put('/provider', async (req, res) => {
        const uid = req.body.uid;
        const doc = await Service.findOne({ uid: uid });
        doc.disabled = !doc.disabled;
        doc.save();
        res.send('success');
    })

module.exports = router;