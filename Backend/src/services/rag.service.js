const noteModel = require("../models/note.model");

const MAX_CONTEXT_CHARS = 14000;
const MAX_NOTES_DEFAULT = 12;

function tokenize(text) {
    return String(text)
        .toLowerCase()
        .split(/\W+/)
        .filter((word) => word.length > 2);
}

function scoreNote(note, terms) {
    const haystack = `${note.title} ${note.content} ${(note.tags || []).join(" ")}`.toLowerCase();
    return terms.reduce((score, term) => (haystack.includes(term) ? score + 1 : score), 0);
}

function formatNoteBlock(note) {
    const tags = (note.tags || []).join(", ") || "none";
    return `### ${note.title}\nTags: ${tags}\n${note.content || "(empty)"}\n`;
}

async function buildNoteContext(userId, message, noteIds) {
    let notes = [];

    if (Array.isArray(noteIds) && noteIds.length > 0) {
        notes = await noteModel
            .find({ userId, _id: { $in: noteIds } })
            .sort({ updatedAt: -1 });
    } else {
        notes = await noteModel
            .find({ userId })
            .sort({ updatedAt: -1 })
            .limit(40);
    }

    if (!noteIds?.length && message) {
        const terms = tokenize(message);
        if (terms.length > 0) {
            notes = notes
                .map((note) => ({ note, score: scoreNote(note, terms) }))
                .sort((a, b) => b.score - a.score)
                .slice(0, MAX_NOTES_DEFAULT)
                .map((item) => item.note);
        } else {
            notes = notes.slice(0, MAX_NOTES_DEFAULT);
        }
    } else {
        notes = notes.slice(0, MAX_NOTES_DEFAULT);
    }

    let context = "";
    const usedNoteIds = [];

    for (const note of notes) {
        const block = formatNoteBlock(note);
        if (context.length + block.length > MAX_CONTEXT_CHARS) break;
        context += block;
        usedNoteIds.push(note._id);
    }

    return { context, noteIds: usedNoteIds };
}

module.exports = { buildNoteContext };
