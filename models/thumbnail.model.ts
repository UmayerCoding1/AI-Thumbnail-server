import mongoose, { Types } from "mongoose";

const { Schema, model, models } = mongoose;

export enum ThumbnailStyle {
    BoldGraphic = "Bold & Graphic",
    TechFuturistic = "Tech/Futuristic",
    Minimalist = "Minimalist",
    Photorealistic = "Photorealistic",
    Illustrated = "Illustrated",
}

export enum AspectRatio {
    "16:9" = "16:9",
    "1:1" = "1:1",
    "9:16" = "9:16",
}


export enum ColorScheme {
    Vibrant = "vibrant",
    Sunset = "sunset",
    Forest = "forest",
    Neon = "neon",
    Purple = "purple",
    Monochrome = "monochrome",
    Ocean = "ocean",
    Pastel = "pastel",
}

export interface IThumbnail extends Document {
    _id?: Types.ObjectId;
    userId: Types.ObjectId;
    title: string;
    description?: string;
    style: ThumbnailStyle;
    aspect_ratio?: AspectRatio;
    color_scheme?: ColorScheme;
    text_overlay?: boolean;
    image_url?: string;
    prompt_used?: string;
    user_prompt?: string;
    isGenerating?: boolean;
    createdAt?: Date;
    updatedAt?: Date
}

const thumbnailSchema = new Schema<IThumbnail>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    style: {
        type: String,
        enum: ThumbnailStyle,
        required: true,
    },
    aspect_ratio: {
        type: String,
        enum: AspectRatio,
        required: true,
    },
    color_scheme: {
        type: String,
        enum: ColorScheme,
        required: true,
    },
    text_overlay: {
        type: Boolean,
        default: false,
    },
    image_url: {
        type: String,
        default: "",
    },
    prompt_used: {
        type: String,
    },
    user_prompt: {
        type: String,
    },
    isGenerating: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

export const Thumbnail = models.Thumbnail || model("Thumbnail", thumbnailSchema);