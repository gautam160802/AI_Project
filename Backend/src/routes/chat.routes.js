const express = require("express");
const { authUser } = require("../middlewares/auth.middleware");
const {
    sendChatMessageController,
    getChatHistoryController,
    clearChatHistoryController,
} = require("../controllers/chat.controller");

const chatRouter = express.Router();

chatRouter.use(authUser);

chatRouter.get("/history", getChatHistoryController);
chatRouter.delete("/history", clearChatHistoryController);
chatRouter.post("/", sendChatMessageController);

module.exports = chatRouter;
