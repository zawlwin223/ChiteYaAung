const mongoose = require ("mongoose")
const {Schema} = mongoose;

const User_Schema = new Schema({
    name:{type:String,require:true},
    ph_no:{type:String,require:true},
    password:{type:String,require:true,unique:true},
    age:{type:Number,require:true},
    gender:{type:String,enum:["Male","Female"],default:"Male"},
    create:{type:Date,default:Date.now}
})

const User = mongoose.model("User",User_Schema)
module.exports = User;