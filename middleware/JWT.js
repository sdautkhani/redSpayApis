
var jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();
const Users = require('../model/users');
// const config = require("../config.js");
// const MONGODB_URI = config.mongodburi;

var database = "";
// mongoClient.connect(
//   MONGODB_URI,
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   },
//   function (error, client) {
//     if (error) {
//       throw error;
//     }
//     database = client.db(process.env.DATABASE);
//   }
// );



module.exports.verifyjwt = async function (token) {
  return new Promise(async (resolve, reject) => {

    var status = "";
    var data = [];
    await jwt.verify(token, process.env.JWT_SECRET, function (err, payload) {

      if (err) {
        status = false;
        data = { "status": status, "payload": [] };
      } else {

        status = true;
        data = { "status": status, "payload": payload.data };
      }

    });

    resolve(data);
  });

}

module.exports.validateToken = async function (req, res) {
  var head = req.headers;
  return new Promise(async (resolve, reject) => {


    try {

      const bearerHearder = req.headers["authorization"];

      if (typeof bearerHearder != "undefined") {
        const bearer = bearerHearder.split(" ");
        const bearerToken = bearer[1].toString();
        req.token = bearerToken;
        await this.verifyjwt(bearerToken).then(async (verify) => {
          if (verify.status) {
            await this.validUsers(verify.payload).then((result) => {
              const data = { "status": verify.status, "details": result }
              resolve(data);

            })

          } else {

            resolve(verify)
          }
        });

      } else {

        resolve([]);
      }

    } catch (err) {

      reject(err);
    }
  });


}
module.exports.validUsers = async function (payload) {
  return new Promise(async (resolve, reject) => {
    Users.findOne({ handleName: payload.handleName }).then(
      async (userDtls) => {
        resolve(userDtls)

      }).catch((error) => {
        reject(error);
      });
  })
  // await collection.findOne({ "userName": payload.userName }, async (err, result) => {
  //   if (err) {

  //     reject(error);
  //   }

  //   resolve(result)


  // });

  //});

};