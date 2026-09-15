import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import AppLayout from "./features/layout/AppLayout";
import NotesList from "./features/notes/pages/NotesList";
import NoteEditor from "./features/notes/pages/NoteEditor";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        element: (
            <Protected>
                <AppLayout />
            </Protected>
        ),
        children: [
            {
                path: "/",
                element: <NotesList />,
            },
            {
                path: "/notes/new",
                element: <NoteEditor />,
            },
            {
                path: "/notes/:id",
                element: <NoteEditor />,
            },
        ],
    },
]);
