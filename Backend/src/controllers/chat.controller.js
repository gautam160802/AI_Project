const chatMessageModel = require("../models/chatMessage.model");
const { buildNoteContext } = require("../services/rag.service");
const { chatWithNotes } = require("../services/ai.service");

async function sendChatMessageController(req, res) {
    const { message, noteIds } = req.body;

    if (!message || !String(message).trim()) {
        return res.status(400).json({ message: "Message is required" });
    }

    const question = String(message).trim();
    const scopedNoteIds = Array.isArray(noteIds) ? noteIds : [];

    try {
        const { context, noteIds: contextNoteIds } = await buildNoteContext(
            req.user.id,
            question,
            scopedNoteIds
        );

        const answer = await chatWithNotes({ question, context });

        const [userMessage, assistantMessage] = await chatMessageModel.insertMany([
            {
                userId: req.user.id,
                role: "user",
                content: question,
                noteIds: contextNoteIds,
            },
            {
                userId: req.user.id,
                role: "assistant",
                content: answer,
                noteIds: contextNoteIds,
            },
        ]);

        res.status(200).json({
            message: "Chat response generated",
            reply: answer,
            noteIds: contextNoteIds,
            messages: [userMessage, assistantMessage],
        });
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json({
            message: err.message || "Failed to generate AI response",
        });
    }
}

async function getChatHistoryController(req, res) {
    const limit = Math.min(Number(req.query.limit) || 40, 100);

    const messages = await chatMessageModel
        .find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("role content noteIds createdAt");

    res.status(200).json({
        message: "Chat history fetched",
        messages: messages.reverse(),
    });
}

async function clearChatHistoryController(req, res) {
    await chatMessageModel.deleteMany({ userId: req.user.id });

    res.status(200).json({
        message: "Chat history cleared",
    });
}

module.exports = {
    sendChatMessageController,
    getChatHistoryController,
    clearChatHistoryController,
};
