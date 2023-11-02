let helper = require("./helper");
let message = require("../model/Message")
let unread = require("../model/Unread_msg")

let live_user =async (socket,user)=>{
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
    socket.on("unreadmessage",()=>[
        unread_msg(socket)
    ])
    socket.on("loadmessage",(data)=>{
        load_msg(socket,data)
    })
    socket.on("getAllMessage",()=>{
        get_all_msg()
    })
}
let load_msg = async (socket,data)=>{
     
    let result = await message.find({
     "from":socket.user._id,
     "to":data.to
    }).populate("from to","name _id")
    console.log(result)
   socket.emit("loadmessage",result)
}

let unread_msg =async (socket)=>{
    let result = await unread.find({to:socket.user._id})
   
    if(result.length>0){
       result.forEach(async(val)=>{
        await unread.findByIdAndDelete(val._id)
       })
    }
    socket.emit("unread",result)
}

let get_all_msg = async ()=>{
    let result = await message.find()
    socket.emit("getAllmsg",result)
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
       
        let from = msg.from._id;
        let to = msg.to._id;
        let message = msg_data;
        await unread({from:from,to:to,message:message.message}).save()
        
    }
    socket.emit("message",msg)
}
module.exports = {initialize}