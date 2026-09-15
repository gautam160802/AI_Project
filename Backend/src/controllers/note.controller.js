const noteModel = require("../models/note.model");

function parseTags(tags) {
    if (!tags) return [];
    if (Array.isArray(tags)) {
        return tags.map((t) => String(t).trim()).filter(Boolean);
    }
    if (typeof tags === "string") {
        return tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
    }
    return [];
}

async function createNoteController(req, res) {
    const { title, content, tags } = req.body;

    if (!title || !String(title).trim()) {
        return res.status(400).json({ message: "Title is required" });
    }

    const note = await noteModel.create({
        userId: req.user.id,
        title: String(title).trim(),
        content: content ?? "",
        tags: parseTags(tags),
    });

    res.status(201).json({
        message: "Note created",
        note,
    });
}

async function listNotesController(req, res) {
    const { q } = req.query;
    const filter = { userId: req.user.id };

    if (q && String(q).trim()) {
        const search = String(q).trim();
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
        ];
    }

    const notes = await noteModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .select("title content tags summary updatedAt createdAt");

    res.status(200).json({
        message: "Notes fetched",
        notes,
    });
}

async function getNoteController(req, res) {
    const note = await noteModel.findOne({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!note) {
        return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({
        message: "Note fetched",
        note,
    });
}

async function updateNoteController(req, res) {
    const { title, content, tags } = req.body;

    const note = await noteModel.findOne({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!note) {
        return res.status(404).json({ message: "Note not found" });
    }

    if (title !== undefined) {
        if (!String(title).trim()) {
            return res.status(400).json({ message: "Title cannot be empty" });
        }
        note.title = String(title).trim();
    }
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = parseTags(tags);

    await note.save();

    res.status(200).json({
        message: "Note updated",
        note,
    });
}

async function deleteNoteController(req, res) {
    const note = await noteModel.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!note) {
        return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({
        message: "Note deleted",
    });
}

module.exports = {
    createNoteController,
    listNotesController,
    getNoteController,
    updateNoteController,
    deleteNoteController,
};
