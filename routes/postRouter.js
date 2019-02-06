const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const Posts = require('../models/posts');

const postRouter = express.Router();
var authenticate = require('../authenticate');

const cors = require('./cors');

postRouter.use(bodyParser.json());

postRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors , (req,res,next) => {
    Posts.find(req.query)
    .sort({_id:-1})
    .populate('author')
    .then((posts) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(posts);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req,res,next)=>{
    req.body.author = req.user._id;
    Posts.create(req.body)
    .then((post) => {
        console.log('Post Created ', post);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(post);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /addpost');
})
.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
    Posts.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

postRouter.route('/myposts')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Posts.find({"author":req.user._id})
    .populate('author')
    .sort({_id:-1})
    .then((posts)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(posts);
    }, (err) => next(err))
    .catch((err) => next(err));
    ;
     
});

postRouter.route('/:postId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Posts.findById(req.params.postId)
    .populate('author')
    .then((post)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(post);
    }, (err) => next(err))
    .catch((err) => next(err));     
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /addpost/'+ req.params.postId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Posts.findByIdAndUpdate(req.params.postId, {
        $set: req.body
    }, { new: true })
    .then((post) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(post);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    Posts.findByIdAndRemove(req.params.postId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports=postRouter;