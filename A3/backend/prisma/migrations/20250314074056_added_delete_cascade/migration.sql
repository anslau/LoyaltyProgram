-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserPromotions" (
    "promotionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("promotionId", "userId"),
    CONSTRAINT "UserPromotions_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserPromotions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserPromotions" ("promotionId", "used", "userId") SELECT "promotionId", "used", "userId" FROM "UserPromotions";
DROP TABLE "UserPromotions";
ALTER TABLE "new_UserPromotions" RENAME TO "UserPromotions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
