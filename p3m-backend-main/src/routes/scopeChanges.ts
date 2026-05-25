import express, { Request, Response } from "express";
import prisma from "../prisma";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;

  const scopeChanges = await prisma.scopeChange.findMany({
    where: projectId ? { projectId } : undefined,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      project: true,
    },
  });

  res.json(scopeChanges);
});

router.post("/", async (req: Request, res: Response) => {
  const { title, description, reason, status, projectId } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "title is required",
    });
  }

  if (!projectId) {
    return res.status(400).json({
      message: "projectId is required",
    });
  }

  const newScopeChange = await prisma.scopeChange.create({
    data: {
      title,
      description,
      reason,
      status: status || "Pending",
      projectId: Number(projectId),
    },
    include: {
      project: true,
    },
  });

  res.status(201).json(newScopeChange);
});

export default router;