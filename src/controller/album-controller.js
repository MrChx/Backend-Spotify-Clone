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

// Fungsi helper untuk mendapatkan public_id dari Cloudinary URL
const getPublicIdFromUrl = (url) => {
    try {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        return filename.split('.')[0]; // Mendapatkan nama file tanpa ekstensi
    } catch (error) {
        console.log("Error getting public_id from URL:", error);
        return null;
    }
};

// Fungsi helper untuk menghapus file dari Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
    try {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
            console.log("Image deleted from Cloudinary successfully");
        }
    } catch (error) {
        console.log("Error deleting image from Cloudinary:", error);
        // Tidak throw error karena penghapusan image adalah operasi sekunder
    }
};

export const createAlbum = async (req, res, next) => {
    try {
        const { title, artist, releaseYear } = req.body;
        const { imageFile } = req.files;

        if (!title || !artist || !releaseYear || !imageFile) {
            return res.status(400).json({
                code: 400,
                status: "failed",
                message: "Please enter all fields"
            });
        }

        const imageUrl = await uploadToCloudinary(imageFile);

        const album = new Album({
            title,
            artist,
            releaseYear,
            imageUrl
        });

        await album.save();

        res.status(201).json({
            code: 201,
            status: "success",
            message: "Album created successfully",
            data: album 
        });
    } catch (error) {
        console.log("Error in createAlbum", error);
        next(error);
    }
};

export const getAllAlbums = async (req, res, next) => {
    try {
        const albums = await Album.find({});

        if(albums.length === 0) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "No albums found"
            });
        }

        res.status(200).json({
            code: 200,
            status: "success",
            message: "Albums retrieved successfully",
            data: {
                albums,
                count: albums.length
            }
        });
    } catch (error) {
        console.log("Error in getAllAlbums", error);
        next(error);
    }
};

export const getAlbumById = async (req, res, next) => {
    try {
        const { albumId } = req.params;

        const album = await Album.findById(albumId).populate("songs");

        if (!album) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Album not found"
            });
        }

        res.status(200).json({
            code: 200,
            status: "success",
            message: "Album retrieved successfully",
            data: album
        });
    } catch (error) {
        console.log("Error in getAlbumById", error);
        next(error);
    }
};

export const updateAlbum = async (req, res, next) => {
    try {
        const { albumId } = req.params;
        const { title, artist, releaseYear } = req.body;
        
        const album = await Album.findById(albumId);
        if (!album) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Album not found"
            });
        }

        if (!title && !artist && !releaseYear && !req.files?.imageFile) {
            return res.status(400).json({
                code: 400,
                status: "failed",
                message: "Please provide at least one field to update"
            });
        }

        if (title) album.title = title;
        if (artist) album.artist = artist;
        if (releaseYear) album.releaseYear = releaseYear;

        if (req.files?.imageFile) {
            try {
                if (album.imageUrl) {
                    await deleteFromCloudinary(album.imageUrl);
                }
                const imageUrl = await uploadToCloudinary(req.files.imageFile);
                album.imageUrl = imageUrl;
            } catch (error) {
                return res.status(400).json({
                    code: 400,
                    status: "failed",
                    message: "Error uploading image"
                });
            }
        }
        await album.save();

        res.status(200).json({
            code: 200,
            status: "success",
            message: "Album updated successfully",
            data: album
        });
    } catch (error) {
        console.log("Error in updateAlbum:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Invalid album ID format"
            });
        }
        
        next(error);
    }
};

export const deleteAlbum = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const album = await Album.findById(id);
        if (!album) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Album not found"
            });
        }

        // Hapus gambar dari Cloudinary
        if (album.imageUrl) {
            await deleteFromCloudinary(album.imageUrl);
        }

        // Hapus songs dan album dari database
        await Song.deleteMany({ albumId: id });
        await Album.findByIdAndDelete(id);
        
        res.status(200).json({
            code: 200,
            status: "success",
            message: "Album deleted successfully",
        });
    } catch (error) {
        console.log("Error in deleteAlbum", error);
        next(error);
    }
};