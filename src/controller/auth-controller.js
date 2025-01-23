import { User } from "../model/user-model.js";
import { clerkClient } from "@clerk/clerk-sdk-node";

export const authCallback = async (req, res, next) => {
    try {
        const { id, firstName, lastName, imageUrl } = req.body;
        const adminEmails = process.env.ADMIN_EMAIL.split(',');

        const userEmail = (await clerkClient.users.getUser(id)).primaryEmailAddress?.emailAddress;

        let user = await User.findOne({ clerkId: id });
        
        if (!user) {
            const role = adminEmails.includes(userEmail) ? 'admin' : 'user';

            user = await User.create({
                clerkId: id,
                fullName: `${firstName || ""} ${lastName || ""}`.trim(),
                imageUrl,
                role
            });

            return res.status(201).json({
				code: 201,
                status: "success",
                message: "User created successfully",
                data: {
                    id: user._id,
                    clerkId: user.clerkId,
                    fullName: user.fullName,
                    imageUrl: user.imageUrl,
                    role: user.role,
                    createdAt: user.createdAt
                }
            });
        }

        res.status(200).json({
            code: 200,
			status: "success",
            message: "User already exists",
            data: {
                id: user._id,
                clerkId: user.clerkId,
                fullName: user.fullName,
                imageUrl: user.imageUrl,
                role: user.role,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.log("Error in auth callback", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const checkAdmin = async (req, res, next) => {
    try {
        const user = await User.findOne({ clerkId: req.body.id });
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Admin privileges required." 
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};