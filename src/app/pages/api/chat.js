import connectDB from '../../lib/db';
import Message from '../../models/Message';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const { room } = req.query;
    const messages = await Message.find({ room }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  }

  if (req.method === 'POST') {
    const { room, username, message } = req.body;
    const newMsg = new Message({ room, username, message });
    await newMsg.save();
    res.status(201).json(newMsg);
  }
}