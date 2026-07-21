import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, postsTable } from "../lib/db";
import { getIO } from "../lib/socket";

const router = Router();

function toFrontendPost(p: typeof postsTable.$inferSelect) {
  return {
    id: p.id,
    authorId: p.authorId,
    authorUsername: p.authorUsername,
    authorIcon: p.authorIcon ?? undefined,
    authorRole: p.authorRole ?? undefined,
    authorIsAdmin: p.authorIsAdmin ?? false,
    title: p.title,
    content: p.content,
    imageUrl: p.imageUrl ?? undefined,
    isAnnouncement: p.isAnnouncement ?? false,
    createdAt: p.createdAt.toISOString(),
    likes: p.likes ?? [],
    dislikes: p.dislikes ?? [],
  };
}

// GET /api/posts
router.get("/posts", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(postsTable)
      .orderBy(desc(postsTable.createdAt))
      .limit(100);
    res.json(rows.map(toFrontendPost));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// POST /api/posts
router.post("/posts", async (req, res) => {
  try {
    const {
      id,
      authorId,
      authorUsername,
      authorIcon,
      authorRole,
      authorIsAdmin,
      title,
      content,
      imageUrl,
      isAnnouncement,
    } = req.body as {
      id: string;
      authorId: string;
      authorUsername: string;
      authorIcon?: string;
      authorRole?: string;
      authorIsAdmin?: boolean;
      title: string;
      content: string;
      imageUrl?: string;
      isAnnouncement?: boolean;
    };

    if (!id || !authorId || !authorUsername || !title || !content) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const [row] = await db
      .insert(postsTable)
      .values({
        id,
        authorId,
        authorUsername,
        authorIcon: authorIcon ?? null,
        authorRole: authorRole ?? null,
        authorIsAdmin: authorIsAdmin ?? false,
        title,
        content,
        imageUrl: imageUrl ?? null,
        isAnnouncement: isAnnouncement ?? false,
        likes: [],
        dislikes: [],
      })
      .returning();

    const post = toFrontendPost(row);
    // Broadcast to all connected clients
    getIO().emit("post:created", post);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

// POST /api/posts/:id/like
router.post("/posts/:id/like", async (req, res) => {
  try {
    const { userId } = req.body as { userId: string };
    if (!userId) { res.status(400).json({ error: "userId required" }); return; }

    const [existing] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, req.params.id))
      .limit(1);
    if (!existing) { res.status(404).json({ error: "Post not found" }); return; }

    const alreadyLiked = existing.likes.includes(userId);
    const newLikes = alreadyLiked
      ? (existing.likes as string[]).filter((id: string) => id !== userId)
      : [...(existing.likes as string[]), userId];
    const newDislikes = (existing.dislikes as string[]).filter((id: string) => id !== userId);

    const [updated] = await db
      .update(postsTable)
      .set({ likes: newLikes, dislikes: newDislikes })
      .where(eq(postsTable.id, req.params.id))
      .returning();

    const post = toFrontendPost(updated);
    getIO().emit("post:updated", post);
    res.json(post);
  } catch {
    res.status(500).json({ error: "Failed to like post" });
  }
});

// POST /api/posts/:id/dislike
router.post("/posts/:id/dislike", async (req, res) => {
  try {
    const { userId } = req.body as { userId: string };
    if (!userId) { res.status(400).json({ error: "userId required" }); return; }

    const [existing] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, req.params.id))
      .limit(1);
    if (!existing) { res.status(404).json({ error: "Post not found" }); return; }

    const alreadyDisliked = existing.dislikes.includes(userId);
    const newDislikes = alreadyDisliked
      ? (existing.dislikes as string[]).filter((id: string) => id !== userId)
      : [...(existing.dislikes as string[]), userId];
    const newLikes = (existing.likes as string[]).filter((id: string) => id !== userId);

    const [updated] = await db
      .update(postsTable)
      .set({ likes: newLikes, dislikes: newDislikes })
      .where(eq(postsTable.id, req.params.id))
      .returning();

    const post = toFrontendPost(updated);
    getIO().emit("post:updated", post);
    res.json(post);
  } catch {
    res.status(500).json({ error: "Failed to dislike post" });
  }
});

// DELETE /api/posts/:id
router.delete("/posts/:id", async (req, res) => {
  try {
    const { authorId } = req.body as { authorId: string };
    const [existing] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, req.params.id))
      .limit(1);
    if (!existing) { res.status(404).json({ error: "Post not found" }); return; }
    // Only author can delete (trust client-side role check for mod/owner)
    if (existing.authorId !== authorId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    await db.delete(postsTable).where(eq(postsTable.id, req.params.id));
    getIO().emit("post:deleted", req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// GET /api/presence — list online users (from in-memory store)
router.get("/presence", async (_req, res) => {
  const { getPresenceList } = await import("../lib/socket");
  res.json(getPresenceList());
});

export default router;
