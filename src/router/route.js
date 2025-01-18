import express from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import { authCallback, getAllUsers, getMessages } from "../controller/auth-controller.js";

const router = express.Router();
router.use(protectRoute, requireAdmin);

router.route('/callback').post(authCallback);
router.route('/getUser').get(protectRoute, getAllUsers);
router.route('/message/:userId').get(protectRoute, getMessages);

export default router;