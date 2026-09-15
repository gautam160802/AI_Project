import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { clearChatHistory, fetchChatHistory, sendChatMessage } from "../services/chat.api";
import { fetchNotes } from "../../notes/services/notes.api";
import { getApiErrorMessage } from "../../../lib/api";
import "../chat.scss";

const ChatPage = () => {
    const [searchParams] = useSearchParams();
    const preselectedNoteId = searchParams.get("noteId");

    const [messages, setMessages] = useState([]);
    const [notes, setNotes] = useState([]);
    const [selectedNoteIds, setSelectedNoteIds] = useState(
        preselectedNoteId ? [preselectedNoteId] : []
    );
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const bottomRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const [historyData, notesData] = await Promise.all([
                    fetchChatHistory(),
                    fetchNotes(),
                ]);
                setMessages(historyData.messages || []);
                setNotes(notesData.notes || []);
            } catch (err) {
                setError(getApiErrorMessage(err, "Failed to load chat"));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, sending]);

    const toggleNoteScope = (noteId) => {
        setSelectedNoteIds((prev) =>
            prev.includes(noteId)
                ? prev.filter((id) => id !== noteId)
                : [...prev, noteId]
        );
    };

    const handleClearHistory = async () => {
        if (!window.confirm("Clear all chat history?")) return;
        setError("");
        try {
            await clearChatHistory();
            setMessages([]);
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to clear chat history"));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || sending) return;

        setSending(true);
        setError("");
        setInput("");

        const optimisticUser = {
            _id: `temp-${Date.now()}`,
            role: "user",
            content: text,
        };
        setMessages((prev) => [...prev, optimisticUser]);

        try {
            const data = await sendChatMessage({
                message: text,
                noteIds: selectedNoteIds,
            });

            setMessages((prev) => {
                const withoutOptimistic = prev.filter((m) => m._id !== optimisticUser._id);
                const saved = data.messages || [];
                return [...withoutOptimistic, ...saved];
            });
        } catch (err) {
            setMessages((prev) => prev.filter((m) => m._id !== optimisticUser._id));
            setInput(text);
            setError(getApiErrorMessage(err, "Failed to send message"));
        } finally {
            setSending(false);
        }
    };

    return (
        <section className="chat-page">
            <div className="chat-page-header">
                <div>
                    <h1>AI Chat</h1>
                    <p className="muted">
                        Ask questions over your notes. Leave scope empty to auto-pick relevant notes.
                    </p>
                </div>
                <button
                    type="button"
                    className="button danger-button"
                    onClick={handleClearHistory}
                    disabled={loading || messages.length === 0}
                >
                    Clear history
                </button>
            </div>

            <div className="chat-scope">
                <p className="scope-label">Scope (optional)</p>
                <div className="scope-notes">
                    {notes.length === 0 && <span className="muted">No notes yet.</span>}
                    {notes.map((note) => (
                        <button
                            key={note._id}
                            type="button"
                            className={`scope-chip ${selectedNoteIds.includes(note._id) ? "active" : ""}`}
                            onClick={() => toggleNoteScope(note._id)}
                        >
                            {note.title}
                        </button>
                    ))}
                </div>
                {selectedNoteIds.length > 0 && (
                    <button
                        type="button"
                        className="button clear-scope"
                        onClick={() => setSelectedNoteIds([])}
                    >
                        Clear scope
                    </button>
                )}
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="chat-thread">
                {loading && <p className="muted">Loading chat...</p>}
                {!loading && messages.length === 0 && (
                    <p className="muted">Try: &quot;What did I write about JWT?&quot;</p>
                )}
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`chat-bubble ${msg.role === "user" ? "user" : "assistant"}`}
                    >
                        <span className="chat-role">
                            {msg.role === "user" ? "You" : "MindVault"}
                        </span>
                        <p>{msg.content}</p>
                    </div>
                ))}
                {sending && (
                    <div className="chat-bubble assistant">
                        <span className="chat-role">MindVault</span>
                        <p className="muted">Thinking...</p>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <form className="chat-input-row" onSubmit={handleSubmit}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your notes..."
                    disabled={sending}
                />
                <button
                    type="submit"
                    className="button primary-button"
                    disabled={sending || !input.trim()}
                >
                    Send
                </button>
            </form>
        </section>
    );
};

export default ChatPage;
