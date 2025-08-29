import { Router } from "express";
import { NotesController } from "../controllers/notesController.ts";
import { authenticateJWT } from "../middleware/auth.ts";

const router = Router();

router.post("/create",authenticateJWT ,NotesController.createNote);
router.get("/fetch", authenticateJWT, NotesController.fetchNotes);
router.delete("/delete", authenticateJWT, NotesController.deleteNotes);

export default router;