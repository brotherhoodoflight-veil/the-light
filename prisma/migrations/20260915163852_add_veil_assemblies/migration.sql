-- CreateTable
CREATE TABLE "Assembly" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assemblyNumber" TEXT,
    "title" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CALLED',
    "accessLevel" TEXT NOT NULL DEFAULT 'BROTHERHOOD',
    "country" TEXT,
    "location" TEXT,
    "hourOfDay" TEXT,
    "convenedAt" DATETIME NOT NULL,
    "presidingMemberId" TEXT,
    "issuedByMemberId" TEXT,
    "witnessDeclamation" TEXT,
    "discussionConversationId" TEXT,
    "createdByMemberId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assembly_presidingMemberId_fkey" FOREIGN KEY ("presidingMemberId") REFERENCES "Member" ("memberId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Assembly_issuedByMemberId_fkey" FOREIGN KEY ("issuedByMemberId") REFERENCES "Member" ("memberId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssemblyMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assemblyId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "seat" TEXT NOT NULL DEFAULT 'INVITED',
    "response" TEXT NOT NULL DEFAULT 'PENDING',
    "respondedAt" DATETIME,
    "seatedAt" DATETIME,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "AssemblyMember_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "Assembly" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssemblyMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("memberId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssemblyAttendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assemblyId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "disposition" TEXT NOT NULL,
    "recordedBy" TEXT NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssemblyAttendance_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "Assembly" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssemblyAttendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("memberId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssemblyRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assemblyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "summary" TEXT,
    "sealedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AssemblyRecord_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "Assembly" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssemblyDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assemblyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PRESERVED',
    "body" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssemblyDocument_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "Assembly" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Assembly_assemblyNumber_key" ON "Assembly"("assemblyNumber");

-- CreateIndex
CREATE INDEX "Assembly_status_idx" ON "Assembly"("status");

-- CreateIndex
CREATE INDEX "Assembly_accessLevel_idx" ON "Assembly"("accessLevel");

-- CreateIndex
CREATE INDEX "Assembly_convenedAt_idx" ON "Assembly"("convenedAt");

-- CreateIndex
CREATE INDEX "AssemblyMember_memberId_idx" ON "AssemblyMember"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "AssemblyMember_assemblyId_memberId_key" ON "AssemblyMember"("assemblyId", "memberId");

-- CreateIndex
CREATE INDEX "AssemblyAttendance_assemblyId_idx" ON "AssemblyAttendance"("assemblyId");

-- CreateIndex
CREATE UNIQUE INDEX "AssemblyAttendance_assemblyId_memberId_key" ON "AssemblyAttendance"("assemblyId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "AssemblyRecord_assemblyId_key" ON "AssemblyRecord"("assemblyId");

-- CreateIndex
CREATE INDEX "AssemblyDocument_assemblyId_idx" ON "AssemblyDocument"("assemblyId");
