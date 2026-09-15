const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

function getProvider() {
    return (process.env.AI_PROVIDER || "openai").toLowerCase();
}

function createConfigError(message) {
    const error = new Error(message);
    error.statusCode = 503;
    return error;
}

function getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw createConfigError("OPENAI_API_KEY is not configured on the server");
    }
    return new OpenAI({ apiKey });
}

function getGeminiModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw createConfigError("GEMINI_API_KEY is not configured on the server");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    return genAI.getGenerativeModel({ model: modelName });
}

function getModelName() {
    if (getProvider() === "gemini") {
        return process.env.GEMINI_MODEL || "gemini-2.0-flash";
    }
    return process.env.AI_MODEL || "gpt-4o-mini";
}

async function runCompletion({ system, user, temperature = 0.2 }) {
    const provider = getProvider();

    if (provider === "gemini") {
        const model = getGeminiModel();
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: user }] }],
            systemInstruction: system,
            generationConfig: { temperature },
        });
        return result.response.text().trim();
    }

    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
        model: getModelName(),
        temperature,
        messages: [
            { role: "system", content: system },
            { role: "user", content: user },
        ],
    });

    return completion.choices[0]?.message?.content?.trim() || "";
}

async function chatWithNotes({ question, context }) {
    const systemPrompt = `You are MindVault, a helpful assistant that answers questions using ONLY the user's personal notes provided below.
If the answer is not in the notes, say you do not have enough information in their notes and suggest what they could add.
Be concise, accurate, and reference note titles when helpful.
Do not invent facts outside the notes.

User notes:
${context || "(No notes available)"}`;

    return runCompletion({
        system: systemPrompt,
        user: question,
        temperature: 0.2,
    });
}

async function summarizeNote({ title, content, tags }) {
    const userPrompt = `Summarize this note in 2-4 short bullet points.

Title: ${title}
Tags: ${(tags || []).join(", ") || "none"}
Content:
${content || "(empty)"}`;

    return runCompletion({
        system: "You write clear, concise summaries for personal knowledge notes.",
        user: userPrompt,
        temperature: 0.3,
    });
}

function parseJsonArray(text) {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start === -1 || end === -1 || end <= start) return [];
    try {
        const parsed = JSON.parse(text.slice(start, end + 1));
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

async function suggestRelatedNoteIds({ note, candidates }) {
    const shortlist = candidates.slice(0, 20).map((item) => ({
        id: String(item._id),
        title: item.title,
        tags: item.tags || [],
        preview: String(item.content || "").slice(0, 180),
    }));

    const userPrompt = `Pick up to 3 note IDs that are most related to the source note.
Return ONLY a JSON array of note id strings. Example: ["64f...", "64a..."]

Source note:
Title: ${note.title}
Tags: ${(note.tags || []).join(", ") || "none"}
Content: ${String(note.content || "").slice(0, 500)}

Candidate notes:
${JSON.stringify(shortlist, null, 2)}`;

    const raw = await runCompletion({
        system: "You identify semantic relationships between personal notes. Output valid JSON only.",
        user: userPrompt,
        temperature: 0.1,
    });

    const allowed = new Set(shortlist.map((item) => item.id));
    return parseJsonArray(raw)
        .map((id) => String(id))
        .filter((id) => allowed.has(id))
        .slice(0, 3);
}

module.exports = {
    chatWithNotes,
    summarizeNote,
    suggestRelatedNoteIds,
    getProvider,
};
