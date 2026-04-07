import { Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from 'bcrypt';
// user registration
export const redisterUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });


        req.session.isLoggedIn = true;
        req.session.userId = newUser._id.toString();

        return res.status(201).json({
            message: "User created successfully", user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error: any) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }

}

// user login
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        req.session.isLoggedIn = true;
        req.session.userId = user._id.toString();

        return res.status(200).json({
            message: "User logged in successfully", user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error: any) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }

}

// logout
export const logoutUser = async (req: Request, res: Response) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Internal server error", error: err.message });
            }
            res.clearCookie("connect.sid");
            return res.status(200).json({ message: "User logged out successfully" });
        });
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// user verification
export const verifyUser = async (req: Request, res: Response) => {
    try {
        if (!req.session.isLoggedIn) {
            return res.status(401).json({ message: "User not logged in" });
        }
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            message: "User verified successfully", user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
