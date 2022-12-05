

const express = require("express");
var jwt = require('jsonwebtoken');
var router = express.Router();
const jverify = require("../middleware/JWT.js");
const bcrypt = require("bcryptjs");
const Users = require('../model/users');
const sharp = require("sharp");
const path = require("path");
const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
       if (file.fieldname === "avatar") {
           cb(null, './upload/profiles/')
       }
       else if (file.fieldname === "idProof1") {
           cb(null, './upload/idProof1/');
       }
       else if (file.fieldname === "idProof2") {
           cb(null, './upload/idProof2/')
       }
    }
});
const upload = multer({
    storage: storage
});
//API to SignIN by User name and Password
router.post("/signin", async function (request, response) {
    var resultData = [];
    var token;
    Users.findOne({ handleName: request.body.handleName }).then(
        async (userDtls) => {
            if (userDtls != null) {
                await bcrypt.compare(request.body.password, userDtls.password, async (err, result) => {
                    if (err) throw err
                    if (result == true) {
                        var data = {
                            "emailId": userDtls.emailId,
                            "handleName": userDtls.handleName
                        }
                        token = jwt.sign({
                            data
                        }, process.env.JWT_SECRET, {

                            expiresIn: process.env.EXP
                        });
                        var verify = await jverify.verifyjwt(token);

                        resultData = {
                            token: token,
                            id: userDtls._id,
                            handleName: userDtls.handleName,
                            message: "LoggedIn successful.",
                            code:200,
                        };

                        response.status(200).json(resultData);
                    } else {
                        response.status(500).json({ 
                            code:400,
                            message: "Invalid Password." });
                    }
                });
            }

        }).catch((error) => {
            response.status(500).send({
                code:500,
                message: 'LoggedIn fail!',
                error: error
            });
        })

});

//API For SignUp
router.post("/register",upload.fields([{
    name: 'avatar', maxCount: 1
  }, {
    name: 'idProof1', maxCount: 1
  }, {
    name: 'idProof2', maxCount: 1
  }]), async (request, response) => {
    let pwd_regex = new RegExp('(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8}');
    if (!pwd_regex.test(request.body.password)) {
        return response.status(400).json({
            code:400,
            message: "Password should conatain minimum 8 character with at least a symbol, upper and lower case letters and a number"
        });
    }
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    let buffer=null;
    let idBuffer1=null;
    let idBuffer2=null;
    if(request.files){
    if(request.files.avatar){
     buffer = await sharp(
        path.join(__dirname, `../upload/profiles/${request.files.avatar[0].filename}`),
      ).png().toBuffer();
    }
    
    if(request.files.idProof1){
        idBuffer1 = await sharp(
        path.join(__dirname, `../upload/idProof1/${request.files.idProof1[0].filename}`),
      ).png().toBuffer();
    }
    
    if(request.files.idProof2){
        idBuffer2 = await sharp(
        path.join(__dirname, `../upload/idProof2/${request.files.idProof2[0].filename}`),
      ).png().toBuffer();
    }
}
    const users = new Users({
        name: request.body.name,
        handleName: request.body.handleName,
        companyName: request.body.companyName,
        rsLicenceKey: request.body.rsLicenceKey,
        contactNumber: request.body.contactNumber,
        emailId: request.body.emailId,
        password: hashedPassword,
        paypalAccount: request.body.paypalAccount,
        joinDate: new Date(),
        createdBy: new Date(),
        avatar: buffer,
        idProof1:idBuffer1,
        idProof2:idBuffer2
    });
    users.save().then(() => {
        response.status(200).json({
            code:200,
            message: 'User created successfully!'
        });
    }).catch(
        (error) => {
           if(error.code==11000){
                const msg=Object.keys(error.keyPattern)[0].toString()+" already exists!";
                response.status(403).json({
                    code:403,
                    message: msg
                });
            }else{
                if(error.name=="ValidationError"){
                    let msg=(error.message).toString();

                    response.status(400).json({
                        code:400,
                        message: msg.substring(msg.indexOf(':'),msg.length-1),
                        error:error
                    });

                }else{
                    response.status(500).json({
                        code:500,
                        message: error.message,
                    });
                }
               
            }
           
        }
    );
});
//API to SignIN by User name and Password
router.get("/varifyToken", async function (request, response) {
    await jverify.validateToken(request, response).then((data) => {
        if (!data.status) {
            response.status(400).send({ 
                code:400,
                message: "Invalid Token!"
         });
            
        } else {
            response.status(200).send({
                code:200,
                 message: "Authentication successful!",
                 details:data.details
                 });
        }
    })
    .catch((error)=>{
        response.status(500).send({
            code:500,
            message: 'Authentication fail!',
            error: error
        });
    })

});




module.exports = router;