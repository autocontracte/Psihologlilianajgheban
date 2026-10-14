-- CreateTable
CREATE TABLE "CabRelease" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    "series" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CabRelease_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CabRoom" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CabRelease_roomId_date_idx" ON "CabRelease"("roomId", "date");

-- CreateIndex
CREATE INDEX "CabRelease_series_idx" ON "CabRelease"("series");
