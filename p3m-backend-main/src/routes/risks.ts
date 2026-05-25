import express, { Request, Response } from "express";
import prisma from "../prisma";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;

  const risks = await prisma.risk.findMany({
    where: projectId ? { projectId } : undefined,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      project: true,
    },
  });

  res.json(risks);
});

router.post("/", async (req: Request, res: Response) => {
  const { title, description, severity, status, projectId } = req.body;

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

  const newRisk = await prisma.risk.create({
    data: {
      title,
      description,
      severity: severity || "Medium",
      status: status || "Open",
      projectId: Number(projectId),
    },
    include: {
      project: true,
    },
  });

  res.status(201).json(newRisk);
});

export default router;