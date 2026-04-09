// get all thumbnails of user

import { Request, Response } from "express";
import { Thumbnail } from "../models/thumbnail.model.js";

export const getAllThumbnails = async (req: Request, res: Response) => {
    try {
        const { userId } = req.session;
        const thumbnails = await Thumbnail.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            message: "Thumbnails fetched successfully",
            thumbnails,
        });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch thumbnails",
            error: error,
        });
    }
};

// get single thumbnail
export const getSingleThumbnail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.session;
        const thumbnail = await Thumbnail.findOne({ _id: id, userId });
        if (!thumbnail) {
            return res.status(404).json({
                success: false,
                message: "Thumbnail not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Thumbnail fetched successfully",
            thumbnail,
        });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch thumbnail",
            error: error,
        });
    }
};