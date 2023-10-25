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
    console.log(result)

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
      var token = jwt.sign(plain_obj, process.env.Private_Key);
      
      plain_obj.token = token;
      console.log(plain_obj)
      await helper.redis_set(plain_obj._id,plain_obj)
      await helper.redis_get(plain_obj._id)
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

module.exports = {register,login,active}