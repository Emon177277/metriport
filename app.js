const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { MetriportMedicalApi, MetriportDevicesApi } = require("@metriport/api-sdk");
const mongoose = require("mongoose");
const userModel = require("./user");
const { UserHeartRate, UserRespirationRate, Temparature, BloodGlucose }= require("./biometric");
const {chartData} = require("./chart");


const uri = "mongodb+srv://metriportAdmin:admin@cluster0.9akw26h.mongodb.net/?retryWrites=true&w=majority";



const app = express();
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());
app.use(express.static('./metriport_fronend'));
app.use(cors());


// ======================================== MONGO-DB-CONNECTION ==================================

async function connect(){
  try{
    await mongoose.connect(uri);
    console.log("connected to mongodb")
  }
  catch(error){
    console.log("there was an error while connecting to mongodb : " + error);
  }
}
connect();

// ================================ METRIPORT-SDK ===========================================

const metriportClient = new MetriportDevicesApi("Z295a0NZMUJpUkFybHlpVmgyZW9pOjllZWY2M2ZmLTJlNjAtNGNiMS05OGIzLTY1NzhhOTQ2ODBkMg", {
  sandbox: false, // set to true to use the sandbox environment
});




// ================================== END-POINTS ============================================

/*
    1. Genaral get function for testing server availability status
*/
app.get('/',async function(req, res){
  res.sendFile(path.join(__dirname, './metriport_fronend/html/home.html'));
});

app.get('/alivia-usage-demo',async function(req, res){
  res.sendFile(path.join(__dirname, './metriport_fronend/html/index.html'));
});

/*
  2. Metriport Webhook
*/
app.post("/",async function(req, res){
  var msg = req.body
  console.log(JSON.stringify(msg))
  var respondObj = {
    "pong" : msg.ping
  }
  res.status(200).send(respondObj);
});

/*
  3. Create Users
*/
app.post("/user", async function(req, res){
  var userId = req.body.userId;
  var metriportUserId = await metriportClient.getMetriportUserId(userId);
  var savedUser = await new userModel({
    metriportUserId: metriportUserId,
    appUserId: userId,
    connectedProviders: [],
    firstName: req.body.firstName,
    last_name: req.body.lastName,
    date_of_birth: req.body.date_of_birth
  });
  savedUser.save();
  res.status(200).send(savedUser);
});

/*
  4. Get All Users 
 */
app.get("/user", async function(req,res){
  var response = await userModel.find();
  res.status(200).send(response);
})


/*
  5. Create Connect Token For Users
*/
app.post("/connectToken", async function(req, res){
    var appUserId = req.body.userId;

    const query = { appUserId: appUserId }

    const user = await userModel.findOne(query);

    metriportid = user.metriportUserId;

    const tokenId = await metriportClient.getConnectToken(metriportid);

    res.status(200).send({widgetLink: `https://connect.metriport.com/?token=${tokenId}&sandbox=false`});
});

/*
  6. Heart Rate With Date
*/
app.get("/heart-rate", async function(req, res){
  const { user_id, startDate, endDate } = req.query;
  var userInfo = await userModel.findById(user_id);
  var heartRateResult = await UserHeartRate.find({
    user_id: user_id, 
    date: {
        $gte: startDate, 
        $lte: endDate,  
    },
  });

  var chartDataResult = chartData(heartRateResult, startDate, endDate, "heartRate");

  res.status(200).send({userInfo, chartDataResult});
});

/*
  7. Glucose with Date
*/
app.get("/glucose", async function(req, res){
  const { user_id, startDate, endDate } = req.query;
  var userInfo = await userModel.findById(user_id);
  var glucoseResult = await BloodGlucose.find({
    user_id: user_id, 
    date: {
        $gte: startDate, 
        $lte: endDate,  
    },
  });

  var chartDataResult = chartData(glucoseResult, startDate, endDate, "avg_blood_glucose");

  res.status(200).send({userInfo, chartDataResult});
});

/*
  8. Temparature with Date
*/
app.get("/temparature", async function(req, res){
  const { user_id, startDate, endDate } = req.query;
  var userInfo = await userModel.findById(user_id);
  var temparatureResult = await Temparature.find({
    user_id: user_id, 
    date: {
        $gte: startDate, 
        $lte: endDate,  
    },
  });

  var chartDataResult = chartData(temparatureResult, startDate, endDate, "avg_temparature");

  res.status(200).send({userInfo, chartDataResult});
});

/*
  9. Respiration with Date
*/
app.get("/respiration-rate", async function(req, res){
  const { user_id, startDate, endDate } = req.query;
  var userInfo = await userModel.findById(user_id);
  var respirationResult = await UserRespirationRate.find({
    user_id: user_id, 
    date: {
        $gte: startDate, 
        $lte: endDate,  
    },
  });

  var chartDataResult = chartData(respirationResult, startDate, endDate, "avg_resperationRate");

  res.status(200).send({userInfo, chartDataResult});
});







// =================================== PORT-CONFIG =========================================
const port = 8080;
app.listen(port,()=>{
    console.log("server started successfully at port " + port);
});