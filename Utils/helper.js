const Redis = require("ioredis")
const redis = new Redis()
const bcrypt = require ("bcrypt")
const jwt = require("jsonwebtoken")

module.exports={
    password_hash:async(password)=>{
         let hashpassword= await bcrypt.hash(password,10)
        return hashpassword;
    },
    compare_password:async(plain_pass,hash_pass)=>{
        const result = await bcrypt.compare(plain_pass,hash_pass)
        return result
    },
    decoded_token:(token)=>{
        var decoded = jwt.verify(token, process.env.Private_Key);
        return decoded
    },
    redis_set:async(key,value)=>{
       
       let result =  await redis.set(key,JSON.stringify(value))
       console.log(result)
    },
    redis_get:async(key)=>{
        // let result = await redis.get(key)
       let user = await redis.get(key)
       return user;
    },
    
}