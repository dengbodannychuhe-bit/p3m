import express, { Request, Response } from "express";
import prisma from "../prisma";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;

  const benefits = await prisma.benefit.findMany({
    where: projectId ? { projectId } : undefined,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      project: true,
    },
  });

  res.json(benefits);
});

router.post("/", async (req: Request, res: Response) => {
  const { title, description, status, projectId } = req.body;

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

  const newBenefit = await prisma.benefit.create({
    data: {
      title,
      description,
      status: status || "Planned",
      projectId: Number(projectId),
    },
    include: {
      project: true,
    },
  });

  res.status(201).json(newBenefit);
});

export default router;