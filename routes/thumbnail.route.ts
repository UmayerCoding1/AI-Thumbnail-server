import { Router } from "express";
import { deleteThumbnail, generateThumbnail } from "../controllers/Thumbnail.controller.js";

const ThumbnailRouter = Router();

ThumbnailRouter.post("/generate", generateThumbnail);
ThumbnailRouter.delete("/delete/:id", deleteThumbnail);

export default ThumbnailRouter;
