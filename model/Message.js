const mongoose = require("mongoose");
const { Schema } = mongoose;
const message_Schema = new Schema({
  from: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  to: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  message: { type: String, required: true },
  unread: { type: Boolean, required: true, default: true },
});
const message = mongoose.model("Message", message_Schema);
module.exports = message;
