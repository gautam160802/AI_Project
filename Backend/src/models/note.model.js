const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: 200,
        },
        content: {
            type: String,
            default: "",
        },
        tags: {
            type: [String],
            default: [],
        },
        summary: {
            type: String,
            default: "",
        },
        relatedNotes: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "notes" }],
            default: [],
        },
    },
    { timestamps: true }
);

const noteModel = mongoose.model("notes", noteSchema);

module.exports = noteModel;
