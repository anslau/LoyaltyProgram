/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "utorid" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "spent" REAL NOT NULL DEFAULT 0,
    "amount" REAL NOT NULL DEFAULT 0,
    "relatedId" INTEGER,
    "remark" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT NOT NULL,
    "processedBy" TEXT,
    "customerId" INTEGER NOT NULL,
    "suspicious" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "customerId", "id", "processedBy", "relatedId", "remark", "spent", "suspicious", "type", "utorid") SELECT "amount", "customerId", "id", "processedBy", "relatedId", "remark", "spent", "suspicious", "type", "utorid" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
