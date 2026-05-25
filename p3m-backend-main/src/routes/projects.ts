import express, { Request, Response } from "express";
import prisma from "../prisma";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      risks: true,
      issues: true,
      scopeChanges: true,
      benefits: true,
      grantMilestones: true,
    },
  });

  res.json(projects);
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({
      message: "invalid project id",
    });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      risks: true,
      issues: true,
      scopeChanges: true,
      benefits: true,
      grantMilestones: true,
    },
  });

  if (!project) {
    return res.status(404).json({
      message: "project not found",
    });
  }

  res.json(project);
});

router.patch("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "invalid project id" });

  const { title, description, manager, budget, stage, status, approvalStatus, priority, department, program, startDate, endDate } = req.body;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return res.status(404).json({ message: "project not found" });

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(manager !== undefined && { manager }),
      ...(budget !== undefined && { budget: budget === null ? null : Number(budget) }),
      ...(stage !== undefined && { stage }),
      ...(status !== undefined && { status }),
      ...(approvalStatus !== undefined && { approvalStatus }),
      ...(priority !== undefined && { priority }),
      ...(department !== undefined && { department }),
      ...(program !== undefined && { program }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
    },
    include: {
      risks: true,
      issues: true,
      scopeChanges: true,
      benefits: true,
      grantMilestones: true,
    },
  });

  res.json(updated);
});

router.post("/", async (req: Request, res: Response) => {
  const { title, description, manager, budget, stage, status, approvalStatus, priority, department, program, startDate, endDate } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "title is required",
    });
  }

  const newProject = await prisma.project.create({
    data: {
      title,
      description,
      manager,
      budget: budget ? Number(budget) : null,
      stage: stage || "Proposal",
      status: status || "Pending Approval",
      approvalStatus: approvalStatus || "Pending",
      priority: priority || "Medium",
      department: department || null,
      program: program || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  res.status(201).json(newProject);
});

export default router;
