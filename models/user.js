var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    name: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
        default: ''
    },
    email:{
       type:String,
       default:''
    },
    address:{
        type:String,
       default:''
    },
    city:{
        type:String,
        default:''
    },
    state:{
        type:String,
        default:''
    },
    latitude: {
        type: Number,
        default:''
    },
    longitude: {
        type: Number,
        default:''
    },
    facebookId: String,
    admin:   {
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);