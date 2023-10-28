const joi = require ("joi")

const User_Schema = joi.object({
    name:joi.string().min(3).max(30).required(),
    ph_no:joi.string().max(11).pattern(new RegExp("^(09|\\+?950?9|\\+?95950?9)\\d{7,9}$")).required(),
    password:joi.string().min(5),
    age:joi.number().required(),
    gender:joi.string().required(),
    image:joi.string().required()
})

module.exports = {User_Schema}