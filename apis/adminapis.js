const express = require("express");
var jwt = require('jsonwebtoken');
var router = express.Router();
const jverify = require("../middleware/JWT.js");
const bcrypt = require("bcryptjs");
const adminUser = require('../model/adminUser');

//API to SignIN by User name and Password
router.post("/signin", async function (request, response) {
    console.log("signin");
    var resultData = [];
    var token;
    adminUser.findOne({ userName: request.body.userName }).then(
        async (userDtls) => {
            if (userDtls != null) {
                await bcrypt.compare(request.body.password, userDtls.password, async (err, result) => {
                    if (err) throw err
                    if (result == true) {
                        var data = {
                           
                            "userName": userDtls.userName
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
router.post("/register", async (request, response) => {
    let pwd_regex = new RegExp('(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8}');
    // if (!pwd_regex.test(request.body.password)) {
    //     return response.status(400).json({
    //         code:400,
    //         message: "Password should conatain minimum 8 character with at least a symbol, upper and lower case letters and a number"
    //     });
    // }
   
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    console.log(hashedPassword);
   
    const admin = new adminUser({
        userName: request.body.userName,
        password: hashedPassword,
        createdOn: new Date()
        
    });
    admin.save().then(() => {
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
module.exports = router;