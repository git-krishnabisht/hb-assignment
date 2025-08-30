import { prisma } from "../lib/prisma";
import type { Request, Response } from "express";

export class NotesController {
  static async createNote(
    req: Request<{}, {}, { note: string }>,
    res: Response
  ) {
    try {
      const me = req.user as any;
      const { note } = req.body;

      if (!note || typeof note !== "string") {
        return res.status(400).json({ error: "Invalid note" });
      }

      await prisma.note.create({
        data: {
          note,
          userId: me.id,
        },
      });

      return res.status(201).json({ message: "Note created succefully" });
    } catch (error) {
      console.error("Create Note error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to create note. Please try again.",
      });
    }
  }

  static async fetchNotes(req: Request, res: Response) {
    try {
      const me = req.user as any;

      const notes = await prisma.note.findMany({
        where: { userId: me.id },
        orderBy: { createdAt: "desc" },
      });

      return res
        .status(200)
        .json({ message: "Fetched notes successfully", body: notes });
    } catch (error) {
      console.error("Fetch Notes error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch notes. Please try again.",
      });
    }
  }

  static async deleteNotes(
    req: Request<{}, {}, { ids: number[] }>,
    res: Response
  ) {
    try {
      const me = req.user as any;
      const { ids } = req.body;

      if (!Array.isArray(ids) || !ids.every((id) => typeof id === "number")) {
        return res.status(400).json({ error: "Invalid note IDs" });
      }

      const deleted = await prisma.note.deleteMany({
        where: {
          id: { in: ids },
          userId: me.id,
        },
      });

      if (deleted.count === 0) {
        return res.status(404).json({ error: "No notes found to delete" });
      }

      return res
        .status(200)
        .json({ message: `${deleted.count} note(s) deleted successfully` });
    } catch (error) {
      console.error("Delete Notes error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to delete notes. Please try again.",
      });
    }
  }
}
