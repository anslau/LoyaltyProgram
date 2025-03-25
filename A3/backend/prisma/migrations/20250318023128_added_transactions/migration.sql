-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "utorid" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "spent" REAL NOT NULL,
    "remark" TEXT NOT NULL DEFAULT '',
    "createBy" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransactionPromotions" (
    "transactionId" INTEGER NOT NULL,
    "promotionId" INTEGER NOT NULL,

    PRIMARY KEY ("transactionId", "promotionId"),
    CONSTRAINT "TransactionPromotions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TransactionPromotions_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "utorid" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "password" TEXT,
    "birthday" TEXT,
    "role" TEXT NOT NULL DEFAULT 'regular',
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" DATETIME,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "suspicious" BOOLEAN,
    "avatarUrl" TEXT,
    "token" TEXT,
    "tokenExpiry" DATETIME,
    "resetTokenExpiry" DATETIME,
    "resetToken" TEXT
);
INSERT INTO "new_User" ("avatarUrl", "birthday", "createdAt", "email", "id", "lastLogin", "name", "password", "points", "resetToken", "resetTokenExpiry", "role", "suspicious", "token", "tokenExpiry", "utorid", "verified") SELECT "avatarUrl", "birthday", "createdAt", "email", "id", "lastLogin", "name", "password", "points", "resetToken", "resetTokenExpiry", "role", "suspicious", "token", "tokenExpiry", "utorid", "verified" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_utorid_key" ON "User"("utorid");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
