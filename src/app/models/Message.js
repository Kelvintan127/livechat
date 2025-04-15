import mongoose from 'mongoose';

// Define the schema
const MessageSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  room: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create and export the model
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

export default Message;
