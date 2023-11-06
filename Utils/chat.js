const helper = require("./helper");
const Message = require("../model/Message");
const unread = require("../model/Unread_msg");
// my way
const User = require("../model/User");

let live_user = async (socket, user) => {
  await helper.redis_set(user._id, user);
};

let initialize = (io, socket) => {
  let user = JSON.parse(socket.user);
  user.socket_id = socket.id;
  socket.user = user;

  live_user(socket, user);

  // socket.on("messageFromClient", (data) => {
  //   incomming_message(io, socket, data);
  // });

  // socket.on("unreadmessage", (msg) => unread_msg(socket, msg));

  socket.on("loadmessage", (data) => {
    load_msg(socket, data);
  });

  // socket.on("getAllMessage", () => {
  //   get_all_msg();
  // });

  // my way
  // Thinking about how to send messages between users
  socket.on("startsChattingWith", (partnerID) =>
    handleChatting(partnerID, user)
  );

  socket.on("sendAMessage", (message) => {
    handleSendingMessage(io, socket, message);
  });

  socket.on("loadAllUnreadMessages", (userID) => {
    handleLoadingAllUnreadMessages(socket, userID);
  });
};

let load_msg = async (socket, data) => {
  let messages = await Message.find({
    $or: [
      {
        from: socket.user._id,
        to: data.to,
      },
      {
        from: data.to,
        to: socket.user._id,
      },
    ],
  }).populate("from to", "name _id");

  messages.forEach((message) => {
    message.unread = false;
    message.save();
  });

  socket.emit("loadmessage", messages);
  socket.emit("allUnreadMessages", []);
};

// let unread_msg = async (socket, msg) => {
//   let result = await unread.find({ to: socket.user._id });

//   if (result.length > 0) {
//     result.forEach(async (val) => {
//       await unread.findByIdAndDelete(val._id);
//     });
//   }
//   socket.emit("unread", result);
// };

// let get_all_msg = async () => {
//   let result = await message.find();
//   socket.emit("getAllmsg", result);
// };

// let incomming_message = async (io, socket, data) => {
//   let msg_data = await new message(data).save();
//   let msg = await message
//     .findById(msg_data._id)
//     .populate("from to", "name _id");
//   let to_user = JSON.parse(await helper.redis_get(msg.to._id));
//   if (to_user) {
//     console.log(
//       "Chatting together: ",
//       to_user.currentChattingWith === data.from
//     );

//     let to_socket_id = to_user.socket_id;
//     let to_socket = io.of("/chat").to(to_socket_id);
//     if (to_socket) {
//       console.log("Sent a message: ", msg);
//       to_socket.emit("message", msg);
//     } else {
//       next(new Error("Socket Error"));
//     }
//   } else {
//     let from = msg.from._id;
//     let to = msg.to._id;
//     let message = msg_data;
//     await unread({ from: from, to: to, message: message.message }).save();
//   }
//   socket.emit("message", msg);
// };

// my way

async function handleChatting(partnerID, user) {
  /* This function handle changing partner */

  // 1. Find partner using partnerID (For validation)
  // 2. If there is a partner with that ID, update user currentChattingWith property
  const partner = JSON.parse(await helper.redis_get(partnerID));
  user.currentChattingWith = partner._id;

  User.findOneAndUpdate(
    { _id: user._id },
    { currentChattingWith: partner._id },
    { new: true }
  ).then(() => console.log("User is successfully updated."));

  await helper.redis_set(user._id, user);
}

async function handleSendingMessage(io, socket, message) {
  const receiver = JSON.parse(await helper.redis_get(message.to));
  const sender = JSON.parse(await helper.redis_get(message.from));
  const receiverSocketID = receiver.socket_id;
  const receiverSocket = io.of("/chat").to(receiverSocketID);

  if (!receiverSocket) return next(new Error("Socket Error"));

  const savedMessage = await new Message(message).save();
  const populatedMessage = await savedMessage.populate("from to", "name _id");

  if (receiver.currentChattingWith === sender._id) {
    console.log("Chatting together");
    receiverSocket.emit("receiveAMessage", populatedMessage);
  } else {
    console.log("Chatting with other one");
    receiverSocket.emit("newUnreadMessage", {
      sender: sender,
      message: populatedMessage.message,
    });
  }

  // Sending to the sender back for showing sender's message
  socket.emit("receiveAMessage", populatedMessage);
}

async function handleLoadingAllUnreadMessages(socket, userID) {
  const allUnreadMessages = await Message.find({ to: userID, unread: true });
  socket.emit("allUnreadMessages", allUnreadMessages);
}

module.exports = { initialize };
