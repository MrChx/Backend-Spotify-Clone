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

export const getUser = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const user = await User.findOne({ clerkId: currentUserId });

		if (!user) {
			return res.status(404).json({
				code: 404,
				status: "error",
				message: "User not found"
			});
		}

		res.status(200).json({
			code: 200,
			status: "success",
			message: "User retrieved successfully",
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
		next(error);
	}
};


export const getMessages = async (req, res, next) => {
    try {
        const myId = req.auth.userId;
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "User ID parameter is required"
            });
        }

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: myId },
                { senderId: myId, receiverId: userId },
            ],
        }).sort({ createdAt: 1 });

        const formattedMessages = messages.map(message => ({
            id: message._id,
            senderId: message.senderId,
            receiverId: message.receiverId,
            content: message.content,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt
        }));

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Messages retrieved successfully",
            data: {
                messages: formattedMessages,
                count: formattedMessages.length
            }
        });

    } catch (error) {
        console.error("Error in getMessages:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                code: 400,
                status: "error",
                message: "Invalid ID format",
                error: error.message
            });
        }

        return next(error);
    }
};