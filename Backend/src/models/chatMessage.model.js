const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        noteIds: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "notes" }],
            default: [],
        },
    },
    { timestamps: true }
);

const chatMessageModel = mongoose.model("chatMessages", chatMessageSchema);

module.exports = chatMessageModel;
