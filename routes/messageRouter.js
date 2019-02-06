const express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var authenticate = require('../authenticate');
const mongoose = require('mongoose');
const Nexmo = require('nexmo');
const nexmo = new Nexmo({
  apiKey: 'd2a96276',
  apiSecret: '4qif1IzJvk7K3SL5'
});
var NodeGeocoder = require('node-geocoder');
var options = {
    provider: 'google',
    httpAdapter: 'https', 
    apiKey: 'AIzaSyAH6xFxBmsyp2aNohJfyARSjf-SvYLYl9o', 
    formatter: null         
  };
var geocoder = NodeGeocoder(options);
var city;
var state;
var google;
const Messages = require('../models/message');

const messageRouter = express.Router();

const cors = require('./cors');

messageRouter.use(bodyParser.json());

messageRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors , (req,res,next) => {
    Messages.find(req.query)
    .then((messages) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(messages);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,(req, res, next) => {
    Messages.create(req.body)
    .then((message) => {
        console.log('Message Created ',message);
        /*geocoder.reverse({lat:message.latitude, lon:message.longitude})
          .then((res)=> {
            var str=res[0].formattedAddress;
            var value=str.split(",");
            var count=value.length;
            var country=value[count-1];
            state=value[count-2];
            city=value[count-3];
            console.log("city name is: " +city+" country: "+country+" state: "+state);
           })
        .catch((err) =>{
         console.log(err);
        });*/
        User.findOne({'city':message.city}).
        then((data)=>{
            if(data!=null){
            const str='Save me: Name- '+message.name+'\nDisaster type- '+message.disasterType+'\nPhone- '+message.phone+'\nLocation- http://maps.google.com/maps?q='+message.latitude+','+message.longitude;
            console.log("send msg: "+str+' to- '+data.phone);
            console.log("data: "+data);
            }
            else{
                User.findOne({'state':message.state}).then((msg)=>{
                    const str='Save me: Name- '+message.name+'\nDisaster type- '+message.disasterType+'\nPhone- '+message.phone+'\nLocation- http://maps.google.com/maps?q='+message.latitude+','+message.longitude;
                    console.log("send msg: "+str+' to- '+msg.phone);
                    /*nexmo.message.sendSms('SOS application', data.phone, str);*/
                });
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(message);
        });
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /messages');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Messages.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

module.exports=messageRouter;