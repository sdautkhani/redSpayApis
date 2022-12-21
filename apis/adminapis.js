const express = require("express");
var jwt = require('jsonwebtoken');
var router = express.Router();
const jverify = require("../middleware/JWT.js");
const bcrypt = require("bcryptjs");
const adminUser = require('../model/adminUser');
const Users = require('../model/users');
const constant = require('../constants.js');
//API to SignIN by User name and Password
router.post("/signin", async function (request, response) {
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
                            code: 200,
                        };

                        response.status(200).json(resultData);
                    } else {
                        response.status(500).json({
                            code: 400,
                            message: "Invalid Password."
                        });
                    }
                });
            }

        }).catch((error) => {
            response.status(500).send({
                code: 500,
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
            code: 200,
            message: 'User created successfully!'
        });
    }).catch(
        (error) => {
            if (error.code == 11000) {
                const msg = Object.keys(error.keyPattern)[0].toString() + " already exists!";
                response.status(403).json({
                    code: 403,
                    message: msg
                });
            } else {
                if (error.name == "ValidationError") {
                    let msg = (error.message).toString();

                    response.status(400).json({
                        code: 400,
                        message: msg.substring(msg.indexOf(':'), msg.length - 1),

                    });

                } else {
                    response.status(500).json({
                        code: 500,
                        message: error.message,
                    });
                }

            }

        }
    );
});
router.get("/getUserList/:status/:pg", async (req, res) => {
    var pageNumber = parseInt(req.params.pg);
    var status = req.params.status;
    var statusConditions = {};
    if (status != "All") {
        statusConditions = {
            "status": constant.status.get(status).value
        }
    }

    const userList = await Users.aggregate([
        {
            $match: statusConditions
        },

        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $sort: { _id: -1 } },

                    { $skip: (pageNumber > 0 ? ((pageNumber - 1) * parseInt(process.env.USER_PER_PAGE)) : 0) },
                    { $limit: (parseInt(process.env.USER_PER_PAGE)) }]
            }
        }

    ]);
    if (Object.keys(userList[0].metadata).length > 0) {
        let totalcount = userList[0].metadata[0].total;
        let numberOfPages = Math.ceil(parseInt(totalcount) / parseInt(process.env.TOKEN_PER_PAGE));
        userList[0].metadata[0].numberOfPages = numberOfPages;
    }
    if (Object.keys(userList[0].data).length > 0) {
        console.log(userList[0]);
        await userList[0].data.map(data => {
            data.idProof1Status = constant.status.get(data.idProof1Status == undefined ? 'Pending' : data.idProof1Status).key;
            data.idProof2Status = constant.status.get(data.idProof2Status == undefined ? 'Pending' : data.idProof2Status).key;
            data.status = constant.status.get(data.status == undefined ? 'Pending' : data.status).key;
        });
    }

    res.json(userList);
});
router.post("/updateUserStatus", async (request, response) => {
   
    // const user = new Users({
       
    // });
    const data=request.body.statusDetails;
    Users.updateOne({ "_id": request.body._id },data).then(() => {
        response.status(200).json({
            code: 200,
            message: 'User created successfully!'
        });
    }).catch(
        (error) => {
         
                    response.status(500).json({
                        code: 500,
                        message: error.message,
                    });
                }

          
    );
});
module.exports = router;