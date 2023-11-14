const mongoose = require("mongoose");
const Schema = mongoose.Schema;



  const chatMessagesSchema=new Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Chat'
    },
    isRead : {type:Boolean, default:false},
    to:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    from:{
      type: mongoose.Schema.Types.ObjectId,
      ref:'User'
    },
    
    message:{type: String},
    messageType:{type:String, enum:["audio","text"],default:'text'},
    
  },{timestamps:true});

  
module.exports = mongoose.model("chatMessage",chatMessagesSchema);

