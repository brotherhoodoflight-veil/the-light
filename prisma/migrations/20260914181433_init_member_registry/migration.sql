-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "membershipType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryInitiator" TEXT,
    "initiationDate" DATETIME,
    "prefecture" TEXT,
    "directorate" TEXT,
    "minervalAssembly" TEXT,
    "cell" TEXT,
    "insinuatorName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuthAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AuthAccount_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("memberId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthAccount_memberId_key" ON "AuthAccount"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthAccount_username_key" ON "AuthAccount"("username");
