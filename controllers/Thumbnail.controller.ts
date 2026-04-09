import { Request, Response } from "express";
import { Thumbnail } from "../models/thumbnail.model.js";
import ai from "../config/ai.js";
import { GenerateContentConfig, HarmBlockThreshold, HarmCategory } from "@google/genai";
import path from "path";
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

const stylePrompts = {
    'Bold & Graphic': 'eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style',
    'Tech/Futuristic': 'futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere',
    'Minimalist': 'minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point',
    'Photorealistic': 'photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
    'Illustrated': 'illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style',
}



const colorSchemeDescriptions = {
    vibrant: 'vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette',
    sunset: 'warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow',
    forest: 'natural green tones, earthy colors, calm and organic palette, fresh atmosphere',
    neon: 'neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow',
    purple: 'purple-dominant color palette, magenta and violet tones, modern and stylish mood',
    monochrome: 'black and white color scheme, high contrast, dramatic lighting, timeless aesthetic',
    ocean: 'cool blue and teal tones, aquatic color palette, fresh and clean atmosphere',
    pastel: 'soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic',
}
export const generateThumbnail = async (req: Request, res: Response) => {
    try {
        const { userId } = req.session;
        const { title, prompt: user_prompt, color_scheme, aspect_ratio, style, text_overlay } = req.body;

        const thumbnail = await Thumbnail.create({
            userId,
            title,
            prompt_used: user_prompt,
            user_prompt,
            color_scheme,
            aspect_ratio,
            style,
            text_overlay,
            isGenerating: true,
        });

        const model = 'gemini-3-pro-image-preview';
        const generateConfig: GenerateContentConfig = {
            maxOutputTokens: 2048,
            temperature: 1,
            topP: 0.95,
            responseModalities: ['IMAGE'],
            imageConfig: {
                aspectRatio: aspect_ratio || '16:9',
                imageSize: '1k'
            },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        }

        let prompt = `
         Create a ${stylePrompts[style as keyof typeof stylePrompts]} for : "${title}".
        `;

        if (color_scheme) {
            prompt += `Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme.`
        }

        if (user_prompt) {
            prompt += `
            Additional details: ${user_prompt}
            `
        }

        prompt += `
           Thumbnail should be ${aspect_ratio}, visually stunning and eye-catching and designed to maximize click-through rate. Mack it bold, professional,impressive to ignore and modern. 
            `



        // Generate Image
        const result: any = await ai.models.generateContent({
            model,
            contents: [prompt],
            config: generateConfig
        });

        console.log(result);
        if (!result?.candidates?.[0]?.content?.parts) {
            throw new Error("Failed to generate thumbnail");
        }

        const parts = result?.candidates?.[0]?.content?.parts;
        let finalBuffer: Buffer | null = null;

        for (const part of parts) {
            if (part.inlineData) {
                finalBuffer = Buffer.from(part.inlineData.data, "base64");
                break;
            }
        }

        if (!finalBuffer) {
            throw new Error("Failed to generate thumbnail");
        }

        const fileName = 'final-output.png';
        const filePath = path.join('images', fileName);

        // Ensure images directory exists
        fs.mkdirSync('images', { recursive: true });

        // Write the buffer to a file
        fs.writeFileSync(filePath, finalBuffer);

        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "image",
        });

        thumbnail.image_url = uploadResult.secure_url;
        thumbnail.isGenerating = false;
        await thumbnail.save();

        res.status(201).json({
            success: true,
            message: "Thumbnail generated successfully",
            thumbnail,
        });

        fs.unlinkSync(filePath);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate thumbnail",
            error: error,
        });
    }
}

export const deleteThumbnail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.session;
        const thumbnail = await Thumbnail.findOneAndDelete({ _id: id, userId });
        if (!thumbnail) {
            return res.status(404).json({
                success: false,
                message: "Thumbnail not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Thumbnail deleted successfully",
            thumbnail,
        });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete thumbnail",
            error: error,
        });
    }
};


