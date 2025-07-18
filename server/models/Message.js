const mongoose = require('mongoose') ;

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  text: { type: String, required: true },
  room: { type: String, default: 'global' },
  file: {
    name: String,
    type: String,
    size: Number,
    data: String
  }
}, { timestamps: true });

module.exports= mongoose.model('Message', messageSchema);