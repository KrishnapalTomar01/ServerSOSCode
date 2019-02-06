const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var messageSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    disasterType: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ''
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    city:{
        type:String,
        default:''
    },
    state:{
        type:String,
        default:''
    }
}, {
    timestamps: true
});

var Messages = mongoose.model('Message', messageSchema);

module.exports = Messages;