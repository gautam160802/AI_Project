import api from "../../../lib/api";

export async function fetchNotes(query = "") {
    const params = query ? { q: query } : {};
    const response = await api.get("/api/notes", { params });
    return response.data;
}

export async function fetchNote(id) {
    const response = await api.get(`/api/notes/${id}`);
    return response.data;
}

export async function createNote(payload) {
    const response = await api.post("/api/notes", payload);
    return response.data;
}

export async function updateNote(id, payload) {
    const response = await api.put(`/api/notes/${id}`, payload);
    return response.data;
}

export async function deleteNote(id) {
    const response = await api.delete(`/api/notes/${id}`);
    return response.data;
}
