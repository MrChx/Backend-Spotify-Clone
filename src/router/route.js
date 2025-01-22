import express from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import { authCallback, getMessages, getUser } from "../controller/auth-controller.js";
import { createAlbum, deleteAlbum, getAlbumById, getAllAlbums, updateAlbum } from "../controller/album-controller.js";

const router = express.Router();

router.route('/callback').post(authCallback);

router.route('/getUser').get(protectRoute, getUser);
router.route('/message/:userId').get(protectRoute, getMessages);

router.route('/album').post(createAlbum);
router.route('/getAlbum').get(getAllAlbums);
router.route('/getAlbum/:albumId').get(getAlbumById);
router.route('/update-album/:albumId').patch(updateAlbum);
router.route('/delete-album/:id').delete(deleteAlbum);

export default router;