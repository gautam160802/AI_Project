const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

/*  require all the routes here*/
const authRouter = require("./routes/auth.routes");
const noteRouter = require("./routes/note.routes");
const chatRouter = require("./routes/chat.routes");

app.use("/api/auth", authRouter);
app.use("/api/notes", noteRouter);
app.use("/api/chat", chatRouter);

module.exports = app;