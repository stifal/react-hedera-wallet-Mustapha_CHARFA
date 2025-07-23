/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountId` on the `Account` table. All the data in the column will be lost.
  - The primary key for the `TransactionRecord` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `consensusTime` on the `TransactionRecord` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TransactionRecord` table. All the data in the column will be lost.
  - You are about to drop the column `recipientId` on the `TransactionRecord` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `TransactionRecord` table. All the data in the column will be lost.
  - You are about to drop the column `txId` on the `TransactionRecord` table. All the data in the column will be lost.
  - Added the required column `email` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `privateKey` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `from` to the `TransactionRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to` to the `TransactionRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionId` to the `TransactionRecord` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Account" ("createdAt", "fullName", "id", "password", "publicKey", "username") SELECT "createdAt", "fullName", "id", "password", "publicKey", "username" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
CREATE TABLE "new_TransactionRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_TransactionRecord" ("amount", "id") SELECT "amount", "id" FROM "TransactionRecord";
DROP TABLE "TransactionRecord";
ALTER TABLE "new_TransactionRecord" RENAME TO "TransactionRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
