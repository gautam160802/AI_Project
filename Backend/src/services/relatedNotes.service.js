const noteModel = require("../models/note.model");
const { suggestRelatedNoteIds } = require("./ai.service");

function tokenize(text) {
    return String(text)
        .toLowerCase()
        .split(/\W+/)
        .filter((word) => word.length > 2);
}

function scoreRelation(source, target) {
    let score = 0;

    const sourceTags = new Set((source.tags || []).map((t) => t.toLowerCase()));
    for (const tag of target.tags || []) {
        if (sourceTags.has(String(tag).toLowerCase())) score += 3;
    }

    const sourceTerms = new Set([
        ...tokenize(source.title),
        ...tokenize(source.content),
    ]);
    const targetText = `${target.title} ${target.content}`.toLowerCase();

    for (const term of sourceTerms) {
        if (targetText.includes(term)) score += 1;
    }

    return score;
}

function rankRelatedByHeuristics(source, candidates, limit = 5) {
    return candidates
        .map((candidate) => ({
            id: candidate._id,
            score: scoreRelation(source, candidate),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.id);
}

async function recomputeRelatedNotes(noteId, userId, { useAi = true } = {}) {
    const note = await noteModel.findOne({ _id: noteId, userId });
    if (!note) return null;

    const candidates = await noteModel.find({
        userId,
        _id: { $ne: noteId },
    });

    let relatedIds = rankRelatedByHeuristics(note, candidates, 5);

    const shouldUseAi =
        useAi &&
        process.env.AI_RELATED_USE_AI !== "false" &&
        candidates.length > 0 &&
        (note.content?.trim() || note.tags?.length > 0);

    if (shouldUseAi) {
        try {
            const aiIds = await suggestRelatedNoteIds({ note, candidates });
            if (aiIds.length > 0) {
                relatedIds = aiIds;
            }
        } catch {
            // Keep heuristic results when AI is unavailable.
        }
    }

    note.relatedNotes = relatedIds;
    await note.save();

    return note;
}

async function cleanupRelatedOnDelete(userId, deletedNoteId) {
    await noteModel.updateMany(
        { userId, relatedNotes: deletedNoteId },
        { $pull: { relatedNotes: deletedNoteId } }
    );
}

module.exports = {
    recomputeRelatedNotes,
    cleanupRelatedOnDelete,
    rankRelatedByHeuristics,
};
