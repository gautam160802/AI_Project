import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
    createNote,
    fetchNote,
    refreshRelatedNotes,
    summarizeNote,
    updateNote,
} from "../services/notes.api";
import { getApiErrorMessage } from "../../../lib/api";
import "../notes.scss";

const NoteEditor = () => {
    const { id } = useParams();
    const isNew = !id || id === "new";
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [summary, setSummary] = useState("");
    const [summarizing, setSummarizing] = useState(false);
    const [relatedNotes, setRelatedNotes] = useState([]);
    const [refreshingLinks, setRefreshingLinks] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isNew) return;

        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await fetchNote(id);
                const note = data.note;
                setTitle(note.title || "");
                setContent(note.content || "");
                setTags((note.tags || []).join(", "));
                setSummary(note.summary || "");
                setRelatedNotes(note.relatedNotes || []);
            } catch (err) {
                setError(getApiErrorMessage(err, "Failed to load note"));
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, isNew]);

    const handleRefreshLinks = async () => {
        if (isNew) return;
        setRefreshingLinks(true);
        setError("");
        try {
            const data = await refreshRelatedNotes(id);
            setRelatedNotes(data.note.relatedNotes || []);
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to refresh related notes"));
        } finally {
            setRefreshingLinks(false);
        }
    };

    const handleSummarize = async () => {
        if (isNew) return;
        setSummarizing(true);
        setError("");
        try {
            const data = await summarizeNote(id);
            setSummary(data.note.summary || "");
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to summarize note"));
        } finally {
            setSummarizing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        const payload = { title, content, tags };

        try {
            if (isNew) {
                const data = await createNote(payload);
                navigate(`/notes/${data.note._id}`);
            } else {
                const data = await updateNote(id, payload);
                setRelatedNotes(data.note.relatedNotes || []);
                navigate("/");
            }
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to save note"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="muted">Loading note...</p>;
    }

    return (
        <section className="note-editor">
            <div className="note-editor-header">
                <h1>{isNew ? "New note" : "Edit note"}</h1>
                <div className="note-editor-actions">
                    {!isNew && (
                        <Link to={`/chat?noteId=${id}`} className="button">
                            Ask AI about this note
                        </Link>
                    )}
                    <Link to="/" className="muted-link">Back to notes</Link>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="note-form">
                <div className="input-group">
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Note title"
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="tags">Tags (comma separated)</label>
                    <input
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="react, jwt, interview"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="content">Content</label>
                    <textarea
                        id="content"
                        rows={14}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your thoughts..."
                    />
                </div>

                {!isNew && relatedNotes.length > 0 && (
                    <div className="related-notes-box">
                        <h2>Related notes</h2>
                        <ul>
                            {relatedNotes.map((related) => (
                                <li key={related._id}>
                                    <Link to={`/notes/${related._id}`}>{related.title}</Link>
                                    {related.tags?.length > 0 && (
                                        <span className="muted">
                                            {related.tags.join(", ")}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isNew && summary && (
                    <div className="note-summary-box">
                        <h2>AI summary</h2>
                        <p>{summary}</p>
                    </div>
                )}

                {error && <p className="form-error">{error}</p>}

                <div className="form-actions">
                    {!isNew && (
                        <>
                            <button
                                type="button"
                                className="button"
                                onClick={handleRefreshLinks}
                                disabled={refreshingLinks}
                            >
                                {refreshingLinks ? "Refreshing..." : "Refresh links"}
                            </button>
                            <button
                                type="button"
                                className="button"
                                onClick={handleSummarize}
                                disabled={summarizing || !content.trim()}
                            >
                                {summarizing ? "Summarizing..." : "AI summarize"}
                            </button>
                        </>
                    )}
                    <button
                        type="submit"
                        className="button primary-button"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : isNew ? "Create note" : "Save changes"}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default NoteEditor;
