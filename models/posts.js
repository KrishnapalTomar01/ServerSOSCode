const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var postSchema= new Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    caption:{
        type:String,
        default:'',
        required:true
    },
    text:{
        type:String,
        default:'',
        required:true
    },
    image:{
        type:String,
        default:''
    }
}, {
    timestamps: true
});

var Posts = mongoose.model('Post', postSchema);

module.exports = Posts;