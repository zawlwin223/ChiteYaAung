let helper = require("./helper");
let message = require("../model/Message")
let live_user =async (socket,user)=>{
    // console.log(user)
    // await helper.redis_set(socket.id,user._id)
    await helper.redis_set(user._id,user)     
}
let initialize = (io,socket)=>{
    let user = JSON.parse(socket.user)
    user.socket_id = socket.id
    socket.user = user
    live_user(socket,user)
    socket.on("messageFromClient",data=>{
        incomming_message(io,socket,data)
    })
}
let incomming_message = async (io,socket,data)=>{
    let msg_data = await new message(data).save()
    let msg = await message.findById(msg_data._id).populate("from to","name _id")
    let to_user =await helper.redis_get(msg.to._id)
    if(to_user) {
        let to_socket_id = JSON.parse(to_user).socket_id
        let to_socket = io.of("/chat").to(to_socket_id)
        if(to_socket){
            to_socket.emit("message",msg)
        }else{
            next(new Error("Socket Error"))
        }
    }else{

    }
    socket.emit("message",msg)
}
module.exports = {initialize}