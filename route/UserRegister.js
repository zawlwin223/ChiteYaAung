const express = require ("express")
const router = express.Router();
const user = require("../controller/User");
const {User_Schema} = require("../Utils/Schema")
const {Validate_Schema} = require("../Utils/Validate")

router.get("/",()=>{
    console.log("This is user register")
})

router.post("/register",Validate_Schema(User_Schema),user.register)
router.post("/login",user.login)
router.get("/active",user.active)

module.exports = router;