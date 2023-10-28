const user = require("../model/User")
const helper = require("../Utils/helper")
const jwt = require("jsonwebtoken")


const register = async (req,res,next)=>{
   let hsh_password =await helper.password_hash(req.body.password);
   delete req.body.password
   req.body.password = hsh_password
   let save = new user(req.body)
   try{
    let result =await save.save()
    res.send(result)

   }catch(e){
    next(new Error(e))
   }
}

const login = async(req,res,next)=>{
   const name = await user.findOne({name:req.body.name})
   if(name){
     let password =await  helper.compare_password(req.body.password,name.password)
     console.log(password)
     if(password==true){
      let plain_obj = name.toObject();
      let token = jwt.sign(plain_obj, process.env.Private_Key);
      
      plain_obj.token = token;
      console.log(plain_obj)
      await helper.redis_set(plain_obj._id,plain_obj)
      await helper.redis_get(plain_obj._id)
      res.cookie("token","hello I am token")
      res.send(plain_obj)
     
     }else{
      next(new Error("Password Incorrect"))
     }
   }else{
      next(new Error("Name Doesnt Exist"))
   }

  
}

const active =async (req,res,next)=>{
   let active_user = [];
   let users = await user.find()

  for(let i=0;i<users.length;i++){
   let data = await helper.redis_get(users[i]._id)
   active_user.push(JSON.parse(data))  
  }
 res.send(active_user)
}

const all_user = async (req,res,next)=>{
   let result = await user.find()
   res.cookie("Hello","Hi")
   res.send(result)
}
const edit = async (req,res,next)=>{
   let current_user = await user.findById(req.params.id)
   
   if(current_user){
    await user.findByIdAndUpdate(current_user._id,req.body)
     let result = await user.findById(current_user._id)
      res.send(result)
   }else{
      next (new Error("Id is incorrect"))
   }
}
module.exports = {register,login,active,all_user,edit}