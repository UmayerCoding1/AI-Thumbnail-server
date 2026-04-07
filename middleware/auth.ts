import { NextFunction, Request, Response } from "express";


export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { isLoggedIn, userId } = req.session;
        if (!isLoggedIn || !userId) {
            return res.status(401).json({ message: "User not logged in" });
        }
        next();
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}