const mongoose = require("mongoose")
const {Schema} = mongoose
const Unread_msg_Schema = new Schema({
    from:{type:Schema.Types.ObjectId,required:true,ref:"User"},
    to:{type:Schema.Types.ObjectId,required:true,ref:"User"},
    message:{type:String,required:true}
})
const unread = mongoose.model("unread",Unread_msg_Schema)
module.exports = unread