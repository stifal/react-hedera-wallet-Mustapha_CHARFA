/*
  Warnings:

  - You are about to drop the column `fullName` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `from` on the `TransactionRecord` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `TransactionRecord` table. All the data in the column will be lost.
  - Added the required column `consensusTime` to the `TransactionRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientId` to the `TransactionRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `TransactionRecord` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Account" ("createdAt", "email", "id", "password", "privateKey", "publicKey", "username") SELECT "createdAt", "email", "id", "password", "privateKey", "publicKey", "username" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
CREATE TABLE "new_TransactionRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "consensusTime" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_TransactionRecord" ("amount", "id", "timestamp", "transactionId") SELECT "amount", "id", "timestamp", "transactionId" FROM "TransactionRecord";
DROP TABLE "TransactionRecord";
ALTER TABLE "new_TransactionRecord" RENAME TO "TransactionRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
