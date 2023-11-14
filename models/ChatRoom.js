const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatRoomSchema=new Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    status:{
        type:String,
        enum:['active','inactive'],
        default:'active'
    }

},{timestamps: true})

module.exports = mongoose.model("Chat",chatRoomSchema);