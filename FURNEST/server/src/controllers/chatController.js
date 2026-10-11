const Chat = require("../models/Chat");
const Message = require("../models/Message");

// POST /api/chats  { otherUserId, postId? }
// Finds an existing chat between these two users, or creates one.
async function getOrCreateChat(req, res) {
    const { otherUserId, postId } = req.body;

    let chat = await Chat.findOne({
        participants: { $all: [req.userId, otherUserId], $size: 2 }
    });

    if (!chat) {
        chat = await Chat.create({ participants: [req.userId, otherUserId], post: postId });
    }

    res.status(200).json(chat);
}

// GET /api/chats
async function getMyChats(req, res) {
    const chats = await Chat.find({ participants: req.userId })
        .populate("participants", "name username avatar")
        .sort({ lastMessageAt: -1 });

    const withLastMessage = await Promise.all(
        chats.map(async (chat) => {
            const lastMessage = await Message.findOne({ chat: chat._id }).sort({ createdAt: -1 });
            const partner = chat.participants.find((p) => p._id.toString() !== req.userId);
            return { chat_id: chat._id, partner, lastMessage };
        })
    );

    res.json(withLastMessage);
}

// GET /api/chats/:chatId/messages
async function getMessages(req, res) {
    const messages = await Message.find({ chat: req.params.chatId }).sort({ createdAt: 1 });
    res.json(messages);
}

// POST /api/chats/:chatId/messages  { content }
async function sendMessage(req, res) {
    const { content } = req.body;
    const message = await Message.create({ chat: req.params.chatId, sender: req.userId, content });
    await Chat.findByIdAndUpdate(req.params.chatId, { lastMessageAt: new Date() });
    res.status(201).json(message);
}

module.exports = { getOrCreateChat, getMyChats, getMessages, sendMessage };
