-- CreateTable
CREATE TABLE "CabRoom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT,
    "ownerWeekdays" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "CabRoom_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "CabPerson" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CabPerson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#9ED8F0',
    "kind" TEXT NOT NULL DEFAULT 'CHIRIAS',
    "manager" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "username" TEXT,
    "passwordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CabSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "personId" TEXT,
    "adminUserId" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CabSession_personId_fkey" FOREIGN KEY ("personId") REFERENCES "CabPerson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CabReservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    "series" TEXT,
    "note" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CabReservation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CabRoom" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CabReservation_personId_fkey" FOREIGN KEY ("personId") REFERENCES "CabPerson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CabPerson_username_key" ON "CabPerson"("username");

-- CreateIndex
CREATE UNIQUE INDEX "CabSession_tokenHash_key" ON "CabSession"("tokenHash");

-- CreateIndex
CREATE INDEX "CabSession_personId_idx" ON "CabSession"("personId");

-- CreateIndex
CREATE INDEX "CabReservation_date_roomId_idx" ON "CabReservation"("date", "roomId");

-- CreateIndex
CREATE INDEX "CabReservation_personId_date_idx" ON "CabReservation"("personId", "date");

-- CreateIndex
CREATE INDEX "CabReservation_series_idx" ON "CabReservation"("series");
