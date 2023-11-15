const helper = require('./helper')
const Message = require('../model/Message')
const User = require('../model/User')

let initialize = (io, socket) => {
  let user = JSON.parse(socket.user)
  user.socket_id = socket.id
  socket.user = user

  socket.on('loadmessage', (data) => {
    load_msg(socket, data)
  })

  socket.on('startsChattingWith', (partnerID) =>
    handleChatting(partnerID, user)
  )

  socket.on('sendAMessage', (message) => {
    handleSendingMessage(io, socket, message)
  })

  socket.on('loadAllUnreadMessages', (userID) => {
    handleLoadingAllUnreadMessages(socket, userID)
  })

  setActiveUser(user).then((activeUser) => {
    socket.broadcast.emit('receiveNewActiveUser', activeUser)
  })

  socket.on('disconnect', () => {
    console.log('User is away from the chat.')
    setInActiveUser(user).then((inActiveUser) => {
      socket.broadcast.emit('receiveNewInActiveUser', inActiveUser)
    })
  })
}

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
  }).populate('from to', 'name _id image')

  messages.forEach((message) => {
    message.unread = false
    message.save()
  })

  socket.emit('loadmessage', messages)
  socket.emit('allUnreadMessages', [])
}

async function handleChatting(partnerID, user) {
  const partner = JSON.parse(await helper.redis_get(partnerID))
  user.currentChattingWith = partner._id

  User.findOneAndUpdate(
    { _id: user._id },
    { currentChattingWith: partner._id },
    { new: true }
  )

  await helper.redis_set(user._id, user)

  console.log('USER', user)
  console.log(`${user.name} is chatting with ${partner.name}`)
}

async function handleSendingMessage(io, socket, message) {
  const receiver = JSON.parse(await helper.redis_get(message.to))
  const sender = JSON.parse(await helper.redis_get(message.from))
  const receiverSocketID = receiver.socket_id
  const receiverSocket = io.of('/chat').to(receiverSocketID)

  if (!receiverSocket) return next(new Error('Socket Error'))

  const savedMessage = await new Message(message).save()
  const populatedMessage = await savedMessage.populate(
    'from to',
    'name _id image'
  )

  if (receiver.currentChattingWith === sender._id) {
    console.log('chatting together')
    receiverSocket.emit('receiveAMessage', populatedMessage)
  } else {
    console.log('chatting with other')
    receiverSocket.emit('newUnreadMessage', {
      sender: sender,
      message: populatedMessage.message,
    })
  }

  console.log(`${sender.name} sent a message to ${receiver.name}`)

  // Sending to the sender back for showing sender's message
  socket.emit('receiveAMessage', populatedMessage)
}

async function handleLoadingAllUnreadMessages(socket, userID) {
  const allUnreadMessages = await Message.find({ to: userID, unread: true })
  socket.emit('allUnreadMessages', allUnreadMessages)
}

async function setActiveUser(user) {
  user.isActive = true
  await helper.redis_set(user._id, user)
  return await User.findOneAndUpdate(
    { _id: user._id },
    { isActive: true },
    { new: true }
  )
}

async function setInActiveUser(user) {
  user.isActive = false
  await helper.redis_set(user._id, user)
  return await User.findOneAndUpdate(
    { _id: user._id },
    { isActive: false },
    { new: true }
  )
}

module.exports = { initialize }
