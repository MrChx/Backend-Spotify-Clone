import express from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import { authCallback, getMessages, getUser } from "../controller/auth-controller.js";
import { createAlbum, deleteAlbum, getAlbumById, getAllAlbums, updateAlbum } from "../controller/album-controller.js";
import { createSong, deleteSong, getAllSongs, getFeaturedSongs, getMadeForYouSongs, getTrendingSongs, updateSong } from "../controller/song-controller.js";

const router = express.Router();

router.route('/callback').post(authCallback);

router.route('/getUser').get(protectRoute, getUser);
router.route('/message/:userId').get(protectRoute, getMessages);

router.route('/album').post(protectRoute, requireAdmin, createAlbum);
router.route('/getAlbum').get(getAllAlbums);
router.route('/getAlbum/:albumId').get(getAlbumById);
router.route('/update-album/:albumId').patch(protectRoute, requireAdmin, updateAlbum);
router.route('/delete-album/:id').delete(protectRoute, requireAdmin, deleteAlbum);

router.route('/song').post(protectRoute, requireAdmin, createSong);
router.route('/getSong').get(protectRoute, requireAdmin, getAllSongs);
router.route('/featured').get(getFeaturedSongs);
router.route('/made-for-you').get(getMadeForYouSongs);
router.route('/trending').get(getTrendingSongs);
router.route('update-song/:id').patch(protectRoute, requireAdmin, updateSong);
router.route('delete-song/:id').delete(protectRoute, requireAdmin, deleteSong);



export default router;