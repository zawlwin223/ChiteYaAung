require("dotenv").config()
const express = require("express")
const app = express()
const server = require('http').createServer(app);
const io = require("socket.io")(server,{
  cors:{
    origin:"http://localhost:3000"
  }
})
const user = require("./route/UserRegister")
const fileupload = require ("express-fileupload")
const mongoose = require ("mongoose");
const helper = require("./Utils/helper");
const cors = require("cors")
const cookie_parser = require ("cookie-parser")
// const { decode } = require("punycode");
app.use(express.static('public'))
app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials:true,    
  
}))

mongoose.connect('mongodb://localhost:27017/Social_Media')
  .then(() => console.log('Connected!'));

app.use(cookie_parser())
app.use(express.json())
app.use(fileupload())


app.use("/api/User",user)


io.of("/chat").use(async (Socket,next)=>{
  let token = Socket.handshake.query.token
  if(token){
   let decoded_token = helper.decoded_token(token)
   let user = await helper.redis_get(decoded_token._id)
    Socket.user = user;
    next()
   
  }else{
    console.log("Tokenization error")
    next(new Error("Tokenization Error"))
  }
}).on("connection",(socket)=>{
 require("./Utils/chat").initialize(io,socket)
})
app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(500).send(err.message)
})
server.listen(process.env.PORT,()=>{
    console.log(`Server is running at ${process.env.PORT}`)
})