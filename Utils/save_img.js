const fs = require("fs")
const path = require("path")
const save_img = async(req,res,next)=>{
    let name =new Date().valueOf()+"_"+req.files.image.name;
    let result = path.dirname(__dirname)
    await req.files.image.mv(`${result}/public/${name}`)
    req.body.image = `${result}/public/${name}`
    next()
}
module.exports = {save_img}