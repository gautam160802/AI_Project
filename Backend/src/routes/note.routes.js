const express = require("express");
const { authUser } = require("../middlewares/auth.middleware");
const {
    createNoteController,
    listNotesController,
    getNoteController,
    updateNoteController,
    deleteNoteController,
} = require("../controllers/note.controller");

const noteRouter = express.Router();

noteRouter.use(authUser);

noteRouter.post("/", createNoteController);
noteRouter.get("/", listNotesController);
noteRouter.get("/:id", getNoteController);
noteRouter.put("/:id", updateNoteController);
noteRouter.delete("/:id", deleteNoteController);

module.exports = noteRouter;
