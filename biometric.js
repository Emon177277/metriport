const mongoose = require("mongoose");

//================= heart rate =====================
const userHeartRateSchema = new mongoose.Schema({
    date: String,
    heartRate: Number,
    source: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, // Reference to the User model
  });

const UserHeartRate = mongoose.model('UserHeartRate', userHeartRateSchema);

//================== resperation rate ================

const userRespirationRateSchema = new mongoose.Schema({
    date: String,
    avg_resperationRate: Number,
    source: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, // Reference to the User model
  });

const UserRespirationRate = mongoose.model('UserRespirationRate', userRespirationRateSchema);

//================== temparature ================

const temparatureSchema = new mongoose.Schema({
    date: String,
    avg_temparature: Number,
    source: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, // Reference to the User model
  });

const Temparature = mongoose.model('Temparature', temparatureSchema);

//================== blood glucose ================

const bloodGlucose = new mongoose.Schema({
    date: String,
    avg_blood_glucose: Number,
    source: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, // Reference to the User model
  });

const BloodGlucose = mongoose.model('BloodGlucose', bloodGlucose);



module.exports = { UserHeartRate, UserRespirationRate, Temparature, BloodGlucose };