/*
  Warnings:

  - Added the required column `txId` to the `TransactionRecord` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TransactionRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "txId" TEXT NOT NULL,
    "consensusTime" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_TransactionRecord" ("amount", "consensusTime", "id", "recipientId", "senderId", "timestamp", "transactionId") SELECT "amount", "consensusTime", "id", "recipientId", "senderId", "timestamp", "transactionId" FROM "TransactionRecord";
DROP TABLE "TransactionRecord";
ALTER TABLE "new_TransactionRecord" RENAME TO "TransactionRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
