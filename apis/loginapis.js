

const express = require("express");
var jwt = require('jsonwebtoken');
var router = express.Router();
const jverify = require("../middleware/JWT.js");
const bcrypt = require("bcryptjs");
const Users = require('../model/users');

//API to SignIN by User name and Password
router.post("/signin", async function (request, response) {
    var resultData = [];
    var token;
    Users.findOne({ handleName: request.body.handleName }).then(
        async (userDtls) => {
            console.log(userDtls);
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
                            message: "LoggedIn successful."
                        };

                        response.status(200).json(resultData);
                    } else {
                        response.status(500).json({ message: "Invalid Password." });
                    }
                });
            }

        }).catch((error) => {
            response.status(500).send({
                message: 'LoggedIn fail!',
                error: error
            });
        })

});

//API For SignUp
router.post("/register", async (request, response) => {
    let pwd_regex = new RegExp('(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8}');
    if (!pwd_regex.test(request.body.password)) {
        return response.status(500).json({
            message: "Password should conatain minimum 8 character with at least a symbol, upper and lower case letters and a number"
        });
    }
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
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
        avatar: request.body.avatar
    });
    users.save().then(() => {
        response.status(200).json({
            message: 'User created successfully!'
        });
    }).catch(
        (error) => {
            response.status(500).json({
                message: error.message,
                error: error
            });
        }
    );
});
//API to SignIN by User name and Password
router.get("/varifyToken", async function (request, response) {
    await jverify.validateToken(request, response).then((data) => {
        if (!data.status) {
            response.status(500).send({ message: "Invalid Token!" });
            
        } else {
            response.status(500).send({
                 message: "Authentication successful!",
                 details:data.details
                 });
        }
    })
    .catch((error)=>{
        response.status(500).send({
            message: 'Authentication fail!',
            error: error
        });
    })

});
router.post("/tests", async function (request, response) {
   

});



module.exports = router;