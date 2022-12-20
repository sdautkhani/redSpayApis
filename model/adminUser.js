const mongoose = require('mongoose');
const adminusersSchema = mongoose.Schema({
    userName: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
    },
    createdOn: {
        type: Date,
        default: Date.now
    }


})

module.exports = mongoose.model('adminUser', adminusersSchema);