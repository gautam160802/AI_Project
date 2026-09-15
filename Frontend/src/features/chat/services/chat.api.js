import api from "../../../lib/api";

export async function fetchChatHistory() {
    const response = await api.get("/api/chat/history");
    return response.data;
}

export async function sendChatMessage({ message, noteIds }) {
    const response = await api.post("/api/chat", { message, noteIds });
    return response.data;
}

export async function clearChatHistory() {
    const response = await api.delete("/api/chat/history");
    return response.data;
}
