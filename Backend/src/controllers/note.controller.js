const noteModel = require("../models/note.model");
const { summarizeNote } = require("../services/ai.service");
const {
    recomputeRelatedNotes,
    cleanupRelatedOnDelete,
} = require("../services/relatedNotes.service");

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

    await recomputeRelatedNotes(note._id, req.user.id);

    const populated = await noteModel
        .findById(note._id)
        .populate("relatedNotes", "title tags");

    res.status(201).json({
        message: "Note created",
        note: populated,
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
    const note = await noteModel
        .findOne({
            _id: req.params.id,
            userId: req.user.id,
        })
        .populate("relatedNotes", "title tags");

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
    await recomputeRelatedNotes(note._id, req.user.id);

    const populated = await noteModel
        .findById(note._id)
        .populate("relatedNotes", "title tags");

    res.status(200).json({
        message: "Note updated",
        note: populated,
    });
}

async function summarizeNoteController(req, res) {
    const note = await noteModel.findOne({
        _id: req.params.id,
        userId: req.user.id,
    });

    if (!note) {
        return res.status(404).json({ message: "Note not found" });
    }

    if (!note.content?.trim()) {
        return res.status(400).json({
            message: "Add some content before summarizing",
        });
    }

    try {
        const summary = await summarizeNote({
            title: note.title,
            content: note.content,
            tags: note.tags,
        });

        note.summary = summary;
        await note.save();

        res.status(200).json({
            message: "Note summarized",
            note,
        });
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json({
            message: err.message || "Failed to summarize note",
        });
    }
}

async function getNotesGraphController(req, res) {
    const notes = await noteModel
        .find({ userId: req.user.id })
        .select("title tags relatedNotes");

    const nodes = notes.map((note) => ({
        id: String(note._id),
        title: note.title,
        tags: note.tags || [],
    }));

    const seen = new Set();
    const links = [];

    for (const note of notes) {
        const source = String(note._id);
        for (const relatedId of note.relatedNotes || []) {
            const target = String(relatedId);
            const key = [source, target].sort().join("|");
            if (seen.has(key)) continue;
            seen.add(key);
            links.push({ source, target });
        }
    }

    res.status(200).json({
        message: "Graph fetched",
        graph: { nodes, links },
    });
}

async function refreshRelatedNotesController(req, res) {
    const note = await recomputeRelatedNotes(req.params.id, req.user.id, {
        useAi: true,
    });

    if (!note) {
        return res.status(404).json({ message: "Note not found" });
    }

    const populated = await noteModel
        .findById(note._id)
        .populate("relatedNotes", "title tags");

    res.status(200).json({
        message: "Related notes refreshed",
        note: populated,
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

    await cleanupRelatedOnDelete(req.user.id, note._id);

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
    summarizeNoteController,
    getNotesGraphController,
    refreshRelatedNotesController,
};
