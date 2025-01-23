import { Album } from "../model/album-model.js";
import { Song } from "../model/song-model.js";
import cloudinary from "../lib/cloudinary.js";

const uploadToCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            resource_type: "auto",
        });
        return result.secure_url;
    } catch (error) {
        console.log("Error in uploadToCloudinary", error);
        throw new Error("Error uploading to cloudinary");
    }
};

const getPublicIdFromUrl = (url) => {
    try {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        return filename.split('.')[0];
    } catch (error) {
        console.log("Error getting public_id from URL:", error);
        return null;
    }
};

const deleteFromCloudinary = async (url) => {
    try {
        const publicId = getPublicIdFromUrl(url);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
            console.log("File deleted from Cloudinary successfully");
            return true;
        }
        return false;
    } catch (error) {
        console.log("Error deleting file from Cloudinary:", error);
        return false;
    }
};

export const createSong = async (req, res) => {
    try {
        const { title, artist, albumId, duration } = req.body;
        const audioFile = req.files?.audioFile;
        const imageFile = req.files?.imageFile;

        if (!title || !artist || !duration) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Title, artist, and duration are required"
            });
        }

        if (!audioFile || !imageFile) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Audio and image files are required"
            });
        }

        const audioUrl = await uploadToCloudinary(audioFile);
        const imageUrl = await uploadToCloudinary(imageFile);

        const song = new Song({
            title,
            artist,
            audioUrl,
            imageUrl,
            duration,
            albumId: albumId || null,
        });

        await song.save();

        // If albumId is provided, add song to album
        if (albumId) {
            const album = await Album.findById(albumId);
            if (!album) {
                // Cleanup uploaded files if album not found
                await deleteFromCloudinary(audioUrl);
                await deleteFromCloudinary(imageUrl);
                return res.status(404).json({
                    code: 404,
                    status: "error",
                    message: "Album not found"
                });
            }

            await Album.findByIdAndUpdate(albumId, {
                $push: { songs: song._id },
            });
        }

        res.status(201).json({
            code: 201,
            status: "success",
            message: "Song created successfully",
            data: song,
        });
    } catch (error) {
        console.log("Error in createSong:", error);
        res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error"
        });
    }
};

export const getAllSongs = async (req, res) => {
    try {
        const songs = await Song.find()
            .sort({ createdAt: -1 })
            .populate('albumId', 'title');

        res.status(200).json({
            code: 200,
            status: "success",
            message: "Songs retrieved successfully",
            data: songs
        });
    } catch (error) {
        console.log("Error in getAllSongs:", error);
        res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error"
        });
    }
};

export const getFeaturedSongs = async (req, res) => {
    try {
        const songs = await Song.aggregate([
            { $sample: { size: 6 } },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    artist: 1,
                    imageUrl: 1,
                    audioUrl: 1,
                },
            },
        ]);

        res.status(200).json({
            code: 200,
            status: "success",
            message: "Featured songs retrieved successfully",
            data: songs
        });
    } catch (error) {
        console.log("Error in getFeaturedSongs:", error);
        res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error"
        });
    }
};

export const getMadeForYouSongs = async (req, res) => {
    try {
        const songs = await Song.aggregate([
            { $sample: { size: 4 } },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    artist: 1,
                    imageUrl: 1,
                    audioUrl: 1,
                },
            },
        ]);

        res.status(200).json({
            code: 200,
            status: "success",
            message: "Made for you songs retrieved successfully",
            data: songs
        });
    } catch (error) {
        console.log("Error in getMadeForYouSongs:", error);
        res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error"
        });
    }
};

export const getTrendingSongs = async (req, res) => {
    try {
        const songs = await Song.aggregate([
            { $sample: { size: 4 } },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    artist: 1,
                    imageUrl: 1,
                    audioUrl: 1,
                },
            },
        ]);

        res.status(200).json({
            code: 200,
            status: "success",
            message: "Trending songs retrieved successfully",
            data: songs
        });
    } catch (error) {
        console.log("Error in getTrendingSongs:", error);
        res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error"
        });
    }
};

export const updateSong = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, artist, duration, albumId } = req.body;
        const audioFile = req.files?.audioFile;
        const imageFile = req.files?.imageFile;

        const song = await Song.findById(id);
        if (!song) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Song not found"
            });
        }

        // Prepare update object
        const updateData = {
            title: title || song.title,
            artist: artist || song.artist,
            duration: duration || song.duration,
            albumId: albumId || song.albumId
        };

        // Handle audio file update
        if (audioFile) {
            await deleteFromCloudinary(song.audioUrl);
            updateData.audioUrl = await uploadToCloudinary(audioFile);
        }

        // Handle image file update
        if (imageFile) {
            await deleteFromCloudinary(song.imageUrl);
            updateData.imageUrl = await uploadToCloudinary(imageFile);
        }

        // Update song
        const updatedSong = await Song.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.status(200).json({
            code: 200,
            status: "success",
            message: "Song updated successfully",
            data: updatedSong
        });
    } catch (error) {
        console.log("Error in updateSong:", error);
        res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error"
        });
    }
};

export const deleteSong = async (req, res) => {
    try {
        const { id } = req.params;

        const song = await Song.findById(id);
        if (!song) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Song not found"
            });
        }

        await deleteFromCloudinary(song.audioUrl);
        await deleteFromCloudinary(song.imageUrl);

        if (song.albumId) {
            await Album.findByIdAndUpdate(song.albumId, {
                $pull: { songs: song._id }
            });
        }

        // Delete song from database
        await Song.findByIdAndDelete(id);

        res.status(200).json({
            code: 200,
            status: "success",
            message: "Song deleted successfully"
        });
    } catch (error) {
        console.log("Error in deleteSong:", error);
        res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error"
        });
    }
};
