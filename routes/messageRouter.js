const express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var authenticate = require('../authenticate');
const mongoose = require('mongoose');
const accountSid = 'ACc80e35bcddbab3e35e1b11ed5ef23b67';
const authToken = 'b5f3323b6886e5cec1f1c966006ea42e';
const client = require('twilio')(accountSid, authToken);

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

function deg2rad(deg) {
    return deg * (Math.PI/180);
}
var i,min,ind;
var dist=[];
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
        User.find()
        .then((users)=>{

            let R=6371;
            for(i=0;i<users.length;i++){
                if(users[i].latitude!=undefined){
                var dLat = deg2rad(users[i].latitude-req.body.latitude); 
                var dLon = deg2rad(users[i].longitude-req.body.longitude); 
                var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(req.body.latitude)) * Math.cos(deg2rad(users[i].latitude)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                dist[i]= R * c; 
                }
            }
            min=dist[0];
            ind=0;
            for(i=1;i<users.length;i++){
                if(dist[i]<min){
                   ind=i;
                   min=dist[i];
                }
            }
            req.body.rescuer=users[ind]._id;
            var state=req.body.state;
            req.body.state=state.replace(/[0-9]/g,'');
            Messages.create(req.body)
             .then((message) => {
               console.log('Message Created ',message);
               const str='Save me: Name- '+message.name+'\nDisaster type- '+message.disasterType+'\nPhone- '+message.phone+'\nLocation- http://maps.google.com/maps?q='+message.latitude+','+message.longitude;
               console.log("send msg: "+str+' to- '+users[ind].phone);
               var phone=users[ind].phone;
               client.messages
                .create({
                    body: str,
                    from: '+17542197883',
                    to: '+91'+phone
                })
                .then(smessage => console.log(smessage.sid));
               console.log("User= "+users[ind]);
               res.statusCode = 200;
               res.setHeader('Content-Type', 'application/json');
               res.json(message);
             }, (err) => next(err))
             .catch((err) => next(err));
       /* User.findOne({'city':message.city}).
        then((data)=>{
            if(data!=null){
            const str='Save me: Name- '+message.name+'\nDisaster type- '+message.disasterType+'\nPhone- '+message.phone+'\nLocation- http://maps.google.com/maps?q='+message.latitude+','+message.longitude;
            console.log("send msg: "+str+' to- '+data.phone);
            console.log("data: "+data);
            nexmo.message.sendSms('SOS application', '91'+data.phone, str);
            }
            else{
                User.findOne({'state':{$regex: message.state, $options: "$i"}}).then((msg)=>{
                    if(msg!=null){
                    const str='Save me: Name- '+message.name+'\nDisaster type- '+message.disasterType+'\nPhone- '+message.phone+'\nLocation- http://maps.google.com/maps?q='+message.latitude+','+message.longitude;
                    console.log("send msg: "+str+' to- '+msg.phone);
                    nexmo.message.sendSms('SOS application', '91'+msg.phone, str);
                    }
                });
            }*/
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