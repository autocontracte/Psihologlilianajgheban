-- CreateTable
CREATE TABLE "CalendarBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "googleEventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CalendarSync" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lastRunAt" DATETIME,
    "lastOkAt" DATETIME,
    "lastError" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "serviceId" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'CABINET',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "adminNote" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'CABINET',
    "holdExpiresAt" DATETIME,
    "googleEventId" TEXT,
    "calendarSeq" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Appointment" ("adminNote", "createdAt", "endsAt", "format", "guestEmail", "guestName", "guestPhone", "id", "notes", "serviceId", "startsAt", "status", "updatedAt", "userId") SELECT "adminNote", "createdAt", "endsAt", "format", "guestEmail", "guestName", "guestPhone", "id", "notes", "serviceId", "startsAt", "status", "updatedAt", "userId" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
CREATE UNIQUE INDEX "Appointment_googleEventId_key" ON "Appointment"("googleEventId");
CREATE INDEX "Appointment_startsAt_idx" ON "Appointment"("startsAt");
CREATE INDEX "Appointment_userId_idx" ON "Appointment"("userId");
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");
CREATE INDEX "Appointment_guestEmail_idx" ON "Appointment"("guestEmail");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CalendarBlock_googleEventId_key" ON "CalendarBlock"("googleEventId");

-- CreateIndex
CREATE INDEX "CalendarBlock_startsAt_idx" ON "CalendarBlock"("startsAt");

