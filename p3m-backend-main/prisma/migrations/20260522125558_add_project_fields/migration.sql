-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "manager" TEXT,
    "budget" INTEGER,
    "stage" TEXT NOT NULL DEFAULT 'Proposal',
    "status" TEXT NOT NULL DEFAULT 'Pending Approval',
    "approvalStatus" TEXT NOT NULL DEFAULT 'Pending',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "department" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Project" ("approvalStatus", "budget", "createdAt", "description", "id", "manager", "stage", "status", "title") SELECT "approvalStatus", "budget", "createdAt", "description", "id", "manager", "stage", "status", "title" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
