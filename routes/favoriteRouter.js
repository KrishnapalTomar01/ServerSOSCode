const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();
var authenticate = require('../authenticate');

const cors = require('./cors');

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser , (req,res,next) => {
    Favorites.findOne({"user":req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser , (req,res,next) => {
    Favorites.findOne({"user":req.user._id})
    .then((favorites)=>{
       if(favorites!=null){
           for(var i=req.body.length-1;i>=0;i--){
               if(favorites.dishes.indexOf(req.body[i]._id)==-1){
                  favorites.dishes.push(req.body[i]);
               }
           }
           favorites.save().then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);                
        }, (err) => next(err));
        } else{
            Favorites.create({"user":req.user._id})
            .then((favorites)=>{
                for(var i=req.body.length-1;i>=0;i--){
                       favorites.dishes.push(req.body[i]);
                }
                favorites.save().then((favorite) => {
                 res.statusCode = 200;
                 res.setHeader('Content-Type', 'application/json');
                 res.json(favorite);                
             }, (err) => next(err));
            }
        ), (err) => next(err);
        }
    }, (err)=> next(err))
    .catch((err)=>next(err))
})
.delete(cors.corsWithOptions, authenticate.verifyUser , (req,res,next) => {
    Favorites.remove({"user":req.user._id})
            .then((resp) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(resp);
            }, (err) => next(err))
    .catch((err)=>next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser , (req,res,next) => {
    Favorites.findOne({"user":req.user._id})
    .then((favorites)=>{
        if(favorites!=null){
            if(favorites.dishes.indexOf(req.params.dishId)==-1){
               favorites.dishes.push(req.params.dishId);
               favorites.save().then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);                
                }, (err) => next(err));    
            }
            else{
                err = new Error("Already Favorite.");
                err.status = 400;
                return next(err);     
            }
        }
        else{
            Favorites.create({"user":req.user._id})
            .then((favorites)=>{
                favorites.dishes.push(req.params.dishId);
                favorites.save().then((favorite) => {
                 res.statusCode = 200;
                 res.setHeader('Content-Type', 'application/json');
                 res.json(favorite);                
             });    
            }, (err) => next(err));
        }
        
    }, (err) => next(err))
    .catch((err)=>next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser , (req,res,next) => {
    Favorites.findOne({"user":req.user._id})
    .then((favorites)=>{
        if(favorites!=null){
            if(favorites.dishes.indexOf(req.params.dishId)!=-1){
                var index=favorites.dishes.indexOf(req.params.dishId);
                favorites.dishes.splice(index,1);
                favorites.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        console.log('Favorite Dish Deleted!', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })      
            }
            else{
                err = new Error('Favorite ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        }
        else{
            err = new Error("You don't have any favorite to delete..");
            err.status = 400;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err)=>next(err));
});

module.exports = favoriteRouter;