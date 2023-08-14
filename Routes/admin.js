const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Service = require('../models/Service');
const Catagory = require('../models/Catagory');

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
    .get('/states', async (req, res) => {
        const catagory = await Catagory.findOne({ user: "admin" });
        res.send(catagory.states);
    })
    .get('/services',async(req,res)=>{
        const catagory = await Catagory.findOne({ user: "admin" });
        res.send(catagory.jobTypes);
    })
    .put('/user', async (req, res) => {
        const uid = req.body.uid;
        const doc = await User.findOne({ uid: uid });
        doc.disabled = !doc.disabled;
        doc.save();
        res.json('success');
    })
    .put('/provider', async (req, res) => {
        const uid = req.body.uid;
        const doc = await Service.findOne({ uid: uid });
        doc.disabled = !doc.disabled;
        doc.save();
        res.json('success');
    })
    .post('/addState', async (req, res) => {
        const state = req.body.stateList;
        const district = req.body.districtList

        try {
            const catagory = await Catagory.findOne({ user: "admin" }).orFail();
            catagory.states = state;
            catagory.save();
        } catch {
            new Catagory({
                user: "admin",
                states: state,
            }).save();
        }
    })
    .post('/addServices', async (req, res) => {
        const services = req.body.jobList;
        try {
            const catagory = await Catagory.findOne({ user: "admin" }).orFail();
            catagory.jobTypes = services;
            catagory.save();
        } catch {
            new Catagory({
                user: "admin",
                jobTypes: services,
            }).save();
        }
    });


module.exports = router;