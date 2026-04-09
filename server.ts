import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import expressSession from "express-session";
import MongoStore from "connect-mongo";
import authRouter from "./routes/auth.route.js";
const app = express();

// Middleware
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
const port = process.env.PORT || 5000;


await connectDB();


declare module 'express-session' {
    interface SessionData {
        isLoggedIn: boolean;
        userId: string;
    }
}

app.use(expressSession({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, //
        httpOnly: true,
        secure: false,
    },
    store: new MongoStore({
        mongoUrl: process.env.MONGODB_URI!,
        collectionName: "sessions"
    })
}));

app.get('/', (req: Request, res: Response) => {

    res.send('Server is Live!');
});

app.use("/api/auth", authRouter);


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});