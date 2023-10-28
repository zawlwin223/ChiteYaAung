const express = require ("express")
const router = express.Router();
const user = require("../controller/User");
const {User_Schema} = require("../Utils/Schema")
const {Validate_Schema} = require("../Utils/Validate");
const {save_img}= require("../Utils/save_img")

router.get("/",()=>{
    console.log("This is user register")
})

router.post("/register",save_img,Validate_Schema(User_Schema),user.register)
router.post("/login",user.login)
router.get("/active",user.active)
router.get("/user",user.all_user)
router.route("/:id")
.patch(save_img,user.edit)
module.exports = router;