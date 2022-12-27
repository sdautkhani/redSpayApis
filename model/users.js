const mongoose = require('mongoose');
const { Buffer } = require('safe-buffer');

const usersSchema = mongoose.Schema({
    name: {
        type: String,
       // requireed: [true, "Name is required!"],
        trim: true,
       // minLength: [2, "Min 2 characters accepted"],
       // maxLength: [20, "Max 20 characters accepted"]
    },
    handleName: {
        type: String,
       // requireed: [true, "Handle name is required!"],
        trim: true,
        // unique: [true, "Handle name already exists!"],
       // minLength: [4, "Min 4 characters accepted"],
        //maxLength: [20, "Max 20 characters accepted"]
    },
    companyName: {
        type: String,
        // requireed: [true, "Company name is required!"],
        // minLength: [2, "Min 2 characters accepted"],
        // maxLength: [20, "Max 20 characters accepted"]
    },
    rsLicenceKey: {
        type: String,
        trim: true,
        // required: [true, "RS licence key is required!"],
        // minLength: [8, "Min 8 characters accepted"],
        // maxLength: [50, "Max 50 characters accepted"]
    },

    emailId: {
        type: String,
        required: [true, "Email address is required!"],
        trim: true,
        lowercase: true,
        unique: [true, "Email address already exists!"],
       // match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address!']
    },
    cellName: {
        type: String,
        // required: [true, "Contact number is required!"],
        // minLength: [10, "Contact number should be of 10 digits"],
        // maxLength: [10, "Contact number should be of 10 digits"]
    },
    paypalAccount: {
        type: String,
        trim: true,
      //  required: [true, "Account number is required!"]
    },
    password: {
        type: String,
       // required: [true, "Password is required!"]
    },
    joinDate: { type: Date, 
        default: Date.now,
       // required: [true, "Joining date is required!"]
     },
    createdOn: {
        type: Date,
        default: Date.now
    },
    avatar:{
        type:String          
    },
    idProof1:{
        type:String          
    },
    idProof2:{
        type:String          
    },
    idProof1Status:{
        type:String          
    },
    idProof2Status:{
        type:String          
    },
    status:{
        type:String
    },
    idProof1Reason:{
        type:String
    },
    idProof2Reason:{
        type:String
    }



})

// usersSchema.path('emailId').validate((value,fn)=>{
//     const eamil_regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');

//         return(eamil_regex.test(value));

// },"Invalid email ID")

module.exports = mongoose.model('Users', usersSchema);