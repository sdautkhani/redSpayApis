const express = require("express");
var jwt = require('jsonwebtoken');
var router = express.Router();
const jverify = require("../middleware/JWT.js");
const bcrypt = require("bcryptjs");
const Users = require('../model/users');
const constant=require('../constants.js');
const Client= require("@heroiclabs/nakama-js").Client;
//API to SignIN by User name and Password
router.post("/signin", async function (request, response) {
    var resultData = [];
    var token;
    Users.findOne({ emailId: request.body.emailId }).then(
        async (userDtls) => {
            if (userDtls != null) {
                await bcrypt.compare(request.body.password, userDtls.password, async (err, result) => {
                    if (err) throw err
                    if (result == true) {
                        var data = {
                           
                            "UserID": userDtls.emailId,
                            "RequestID":"",
                            "RequestorID":"",
                            "ActionID":"",
                            "ReasonID":"",
                            "EntityID":""

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
                            emailId: userDtls.emailId,
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
router.post("/register", async (request, response) => {
    let pwd_regex = new RegExp('(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8}');
    if (!pwd_regex.test(request.body.password)) {
        return response.status(400).json({
            code:400,
            message: "Password should conatain minimum 8 character with at least a symbol, upper and lower case letters and a number"
        });
    }
   
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    const users = new Users({
        name: request.body.name,
        handleName: request.body.handleName,
        companyName: request.body.companyName,
        rsLicenceKey: request.body.rsLicenceKey,
        cellName: request.body.cellName,
        emailId: request.body.emailId,
        password: hashedPassword,
        paypalAccount: request.body.paypalAccount,
        joinDate: request.body.joinDate,
        createdOn: new Date(),
        avatar: request.body.avatar,
        idProof1:request.body.idProof1,
        idProof2:request.body.idProof2,
        idProof1Status:constant.status.get(request.body.idProof1Status).value,
        idProof2Status:constant.status.get(request.body.idProof2Status).value,
        status:constant.status.get(request.body.status).value,
        idProof1Reason:request.body.idProof1Reason,
        idProof2Reason:request.body.idProof2Reason,
        reason:request.body.reason,
        
    });
    users.save().then(() => {
        // const create = true;
        // const client = new Client("defaultkey", "127.0.0.1", "7350");
        // console.log(client);
        // client.authenticateEmail(request.body.emailId, hashedPassword, create, request.body.emailId).then(
        //   async session => {
        //     console.log(session);
        //     console.log("User created")
        //   }).catch(e => {
        //     // console.log("error authenticating.");
        //     console.log(e);
        //   });
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
router.get("/getUserById/:emailId", async function (request, response) {
   console.log(request.params.id);
    Users.find({ emailId: request.params.emailId }).then(
        async (userDtls) => {
            console.log(userDtls);
            if(userDtls){
                response.status(200).send(userDtls);
            }else{
                response.status(500).send({
                    code:500,
                    message: 'User does not exist!',
                    
                });
            }
        
        }).catch((error) => {
            response.status(500).send({
                code:500,
                message: 'Unable to get user details!',
                error: error
            });
        })


});




module.exports = router;