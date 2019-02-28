const express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var authenticate = require('../authenticate');
const mongoose = require('mongoose');
const Messages = require('../models/message');

const statisticsRouter = express.Router();

const cors = require('./cors');

statisticsRouter.use(bodyParser.json());

statisticsRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors , (req,res,next) => {
    Messages.aggregate([
        {
           $group:{
              _id:{state:'$state',city:'$city'},
              total:{$sum:1},
              rescueNum:{$sum:{$cond:[{$eq:['$rescue',true]},1,0]}},
              details:{$push:{year:{$year:'$createdAt'},month:{$month:'$createdAt'},disasterType:'$disasterType'}}
            }
        }
    ]
    ,function(err,result){
           if(err) next(err);
           else{
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
               res.json(result);
           }
    })
});

statisticsRouter.route('/rescued')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors , (req,res,next) => {
    Messages.aggregate([
       {
           $match:{
               rescue:true
           }
       },
       {
           $group:{
              _id:{state:'$state',city:'$city'},
              total:{$sum:1},
              time:{$push:{year:{$year:'$createdAt'},month:{$month:'$createdAt'}}}
           }
        }
    ]
    ,function(err,result){
           if(err) next(err);
           else{
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(result);
           }
    })
});

module.exports=statisticsRouter;