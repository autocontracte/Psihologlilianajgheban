-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CabReservation" (
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
    "cancelledAt" DATETIME,
    "cancelledBy" TEXT,
    "cancelFee" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CabReservation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CabRoom" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CabReservation_personId_fkey" FOREIGN KEY ("personId") REFERENCES "CabPerson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CabReservation" ("createdAt", "createdBy", "date", "endMin", "id", "note", "personId", "roomId", "series", "startMin") SELECT "createdAt", "createdBy", "date", "endMin", "id", "note", "personId", "roomId", "series", "startMin" FROM "CabReservation";
DROP TABLE "CabReservation";
ALTER TABLE "new_CabReservation" RENAME TO "CabReservation";
CREATE INDEX "CabReservation_date_roomId_idx" ON "CabReservation"("date", "roomId");
CREATE INDEX "CabReservation_personId_date_idx" ON "CabReservation"("personId", "date");
CREATE INDEX "CabReservation_series_idx" ON "CabReservation"("series");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
