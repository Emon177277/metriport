const mongoose = require("mongoose");
const user = mongoose.Schema(
    {
        metriportUserId: {
          type: String,
          required: false,
        },
        appUserId: {
          type: String,
          required: true,
        },
        connectedProviders: {
          type: [String],
          default: [],     
        },
        firstName:{
          type: String,
          required: false
        },
        last_name:{
          type: String,
          required: false
        },
        date_of_birth:{
          type: String,
          required: false
        }

      }
);

const userModel = mongoose.model('user', user);

module.exports = userModel;