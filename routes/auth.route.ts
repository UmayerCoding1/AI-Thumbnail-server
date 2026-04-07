import { Router } from "express";
import { redisterUser, loginUser, logoutUser, verifyUser } from "../controllers/auth.controllers.js";
import { protect } from "../middleware/auth.js";

const authRouter = Router();

authRouter.post("/register", redisterUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", protect, logoutUser);
authRouter.get("/verify", protect, verifyUser);

export default authRouter;
