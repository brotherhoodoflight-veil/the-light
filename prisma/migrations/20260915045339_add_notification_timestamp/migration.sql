-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "conversationId" TEXT,
    "messageId" TEXT,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("memberId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("body", "conversationId", "id", "memberId", "messageId", "readAt", "type") SELECT "body", "conversationId", "id", "memberId", "messageId", "readAt", "type" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE INDEX "Notification_memberId_readAt_idx" ON "Notification"("memberId", "readAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
