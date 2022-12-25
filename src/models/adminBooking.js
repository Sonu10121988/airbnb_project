const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// create schema for admin booking information
const adminBookingSchema = new mongoose.Schema({
    homename:{
        type: String,
        required: true,
        unique: true
    },
    Location:{
        type: String,
        required: true
    },
    homeurl:{
        type: String,
    },
    minimum_nights:{
        type: String,
    },
    Overview:{
        type: String,
    },
    cancellation_policy:{
        type: String,
    },
    Price:{
        type: Number,
        required: true,
    },
})


//create collection
const adminDetail = new mongoose.model("adminBooking", adminBookingSchema);

module.exports= adminDetail;

