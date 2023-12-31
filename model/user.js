const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: null
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        default: null
    },
    token: {
        type: String,
        default: null
    },
})

module.exports = mongoose.model("user", userSchema)