import { useEffect, useState } from "react";
import { Link } from "react-router";
import { deleteNote, fetchNotes } from "../services/notes.api";
import { getApiErrorMessage } from "../../../lib/api";
import "../notes.scss";

const NotesList = () => {
    const [notes, setNotes] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadNotes = async (query = "") => {
        setLoading(true);
        setError("");
        try {
            const data = await fetchNotes(query);
            setNotes(data.notes || []);
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to load notes"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotes();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        loadNotes(search);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this note?")) return;
        try {
            await deleteNote(id);
            setNotes((prev) => prev.filter((n) => n._id !== id));
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to delete note"));
        }
    };

    return (
        <section className="notes-page">
            <div className="notes-page-header">
                <div>
                    <h1>Your notes</h1>
                    <p className="muted">Capture ideas now. AI chat comes next.</p>
                </div>
                <Link to="/notes/new" className="button primary-button">
                    New note
                </Link>
            </div>

            <form className="notes-search" onSubmit={handleSearch}>
                <input
                    type="search"
                    placeholder="Search title, content, or tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="button">Search</button>
            </form>

            {error && <p className="form-error">{error}</p>}
            {loading && <p className="muted">Loading notes...</p>}

            {!loading && notes.length === 0 && (
                <div className="empty-state">
                    <p>No notes yet.</p>
                    <Link to="/notes/new" className="button primary-button">
                        Create your first note
                    </Link>
                </div>
            )}

            <ul className="notes-list">
                {notes.map((note) => (
                    <li key={note._id} className="note-card">
                        <div>
                            <Link to={`/notes/${note._id}`} className="note-title">
                                {note.title}
                            </Link>
                            {note.tags?.length > 0 && (
                                <div className="note-tags">
                                    {note.tags.map((tag) => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                            )}
                            <p className="note-preview">
                                {(note.content || "").slice(0, 140)}
                                {(note.content || "").length > 140 ? "…" : ""}
                            </p>
                        </div>
                        <button
                            type="button"
                            className="button danger-button"
                            onClick={() => handleDelete(note._id)}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default NotesList;
