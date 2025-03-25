/*
  Warnings:

  - You are about to drop the `_UserPromotions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_resetToken_key";

-- DropIndex
DROP INDEX "_UserPromotions_B_index";

-- DropIndex
DROP INDEX "_UserPromotions_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_UserPromotions";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "UserPromotions" (
    "promotionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("promotionId", "userId"),
    CONSTRAINT "UserPromotions_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserPromotions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Promotion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "minSpending" INTEGER,
    "rate" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Promotion" ("id") SELECT "id" FROM "Promotion";
DROP TABLE "Promotion";
ALTER TABLE "new_Promotion" RENAME TO "Promotion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
