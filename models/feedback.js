const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var feedbackSchema= new Schema({
    firstname: {
        type:String,
        default:''
    },
    lastname:{
        type:String,
        default:''
    },
    telnum:{
        type:String,
        default:''
    },
    email:{
        type:String,
        default:''
    },
    agree:{
        type:Boolean,
        default:false
    },
    contacttype:{
        type:String,
        default:'',
    },
    message:{
        type:String,
        default:''
    }
}, {
    timestamps: true
});

var Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;