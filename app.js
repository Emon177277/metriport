const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());
app.use(cors());

//route
app.get('/',function(req, res){
    res.json({
        "msg" : "The Get API is Working fine"
    });
});

app.post("/",function(req, res){
    var msg = JSON.stringify(req.body)
    console.log(msg)
    res.send(msg);
});

//enable port
app.listen(8080 ,()=>{
  console.log("the server is on");  
} );