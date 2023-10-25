const Validate_Schema = (schema)=>{
   return async (req,res,next)=>{
  
    let validation = schema.validate(req.body);
    if(validation.error){
     next(new Error(validation.error.message))
    }else{
      next()
    }
    
  
   }
}

module.exports = {Validate_Schema}