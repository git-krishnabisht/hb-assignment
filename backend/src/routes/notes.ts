import { Router } from "express";
import { NotesController } from "../controllers/notesController.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = Router();

router.post("/create",authenticateJWT ,NotesController.createNote);
router.get("/fetch", authenticateJWT, NotesController.fetchNotes);
router.delete("/delete", authenticateJWT, NotesController.deleteNotes);

export default router;