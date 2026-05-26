import express, { Request, Response } from "express";
import prisma from "../prisma";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;

  const grantMilestones = await prisma.grantMilestone.findMany({
    where: projectId ? { projectId } : undefined,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      project: true,
    },
  });

  res.json(grantMilestones);
});

router.post("/", async (req: Request, res: Response) => {
  const { title, description, dueDate, status, complianceStatus, projectId } = req.body;

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

  const newGrantMilestone = await prisma.grantMilestone.create({
    data: {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: status || "Pending",
      complianceStatus: complianceStatus || "Pending",
      projectId: Number(projectId),
    },
    include: {
      project: true,
    },
  });

  res.status(201).json(newGrantMilestone);
});

router.patch("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { title, description, dueDate, status, complianceStatus } = req.body;

  if (!id) {
    return res.status(400).json({
      message: "valid milestone id is required",
    });
  }

  const updatedGrantMilestone = await prisma.grantMilestone.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(status !== undefined && { status }),
      ...(complianceStatus !== undefined && { complianceStatus }),
    },
    include: {
      project: true,
    },
  });

  res.json(updatedGrantMilestone);
});

export default router;
