const express = require("express");
const { authUser } = require("../middlewares/auth.middleware");
const {
    createNoteController,
    listNotesController,
    getNoteController,
    updateNoteController,
    deleteNoteController,
    summarizeNoteController,
    getNotesGraphController,
    refreshRelatedNotesController,
} = require("../controllers/note.controller");

const noteRouter = express.Router();

noteRouter.use(authUser);

noteRouter.post("/", createNoteController);
noteRouter.get("/", listNotesController);
noteRouter.get("/graph", getNotesGraphController);
noteRouter.post("/:id/summarize", summarizeNoteController);
noteRouter.post("/:id/refresh-links", refreshRelatedNotesController);
noteRouter.get("/:id", getNoteController);
noteRouter.put("/:id", updateNoteController);
noteRouter.delete("/:id", deleteNoteController);

module.exports = noteRouter;
