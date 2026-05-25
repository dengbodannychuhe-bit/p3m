import express, { Request, Response } from "express";
import prisma from "../prisma";

const router = express.Router();

router.get("/summary", async (_req: Request, res: Response) => {
  const [
    totalProjects,
    totalRisks,
    totalIssues,
    totalScopeChanges,
    totalBenefits,
    totalGrantMilestones,
    projects,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.risk.count(),
    prisma.issue.count(),
    prisma.scopeChange.count(),
    prisma.benefit.count(),
    prisma.grantMilestone.count(),
    prisma.project.findMany({
      select: {
        stage: true,
        status: true,
      },
    }),
  ]);

  const projectsByStage: Record<string, number> = {};
  const projectsByStatus: Record<string, number> = {};

  for (const project of projects) {
    projectsByStage[project.stage] = (projectsByStage[project.stage] || 0) + 1;
    projectsByStatus[project.status] = (projectsByStatus[project.status] || 0) + 1;
  }

  res.json({
    totalProjects,
    totalRisks,
    totalIssues,
    totalScopeChanges,
    totalBenefits,
    totalGrantMilestones,
    projectsByStage,
    projectsByStatus,
  });
});

export default router;