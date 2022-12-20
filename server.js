const express = require("express");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require("express-session");
const mongoose=require("mongoose");
const swaggerUi = require('swagger-ui-express'); 
const port = process.env.PORT || 3000;
const config = require("./config");
const MONGODB_URI = config.mongodburi;
const swaggerDocument = require("./swaggerDocs.json");
const loginapis = require("./apis/loginapis.js");
const adminapis = require("./apis/adminapis.js");


var app = express();
app.use('/api-doc',swaggerUi.serve,swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(
  session({
    secret:  process.env.SESSION_SECRIT,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 24*60*60*1000 }
  })
);
app.use(cookieParser("secretcode"));
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
  })
  .catch((error) => {
    console.log('Unable to connect to MongoDB!');
    console.error(error);
  });
app.listen(port, async () => {  
    console.log("Listen port",port);
});
app.use('/login', loginapis);
app.use('/admin', adminapis);



