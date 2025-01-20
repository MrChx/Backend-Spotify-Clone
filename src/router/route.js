import express from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import { authCallback, getMessages, getUser } from "../controller/auth-controller.js";

const router = express.Router();

router.route('/callback').post(authCallback);

router.route('/getUser').get(protectRoute, getUser);
router.route('/message/:userId').get(protectRoute, getMessages);

export default router;