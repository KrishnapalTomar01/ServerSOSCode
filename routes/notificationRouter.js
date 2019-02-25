const express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var authenticate = require('../authenticate');
const mongoose = require('mongoose');
const Messages = require('../models/message');

const notificationRouter = express.Router();

const cors = require('./cors');

notificationRouter.use(bodyParser.json());

notificationRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser , (req,res,next) => {
    Messages.find({"rescuer":req.user._id})
    .sort({_id:-1})
    .then((messages)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(messages);
    }, (err) => next(err))
    .catch((err) => next(err));
});

notificationRouter.route('/:messageId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Messages.findByIdAndUpdate(req.params.messageId, {
        $set: req.body
    }, { new: true })
    .then((message) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(message);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});
module.exports=notificationRouter;