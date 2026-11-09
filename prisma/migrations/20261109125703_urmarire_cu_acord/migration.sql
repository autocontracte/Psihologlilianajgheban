-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "firstReferrer" TEXT NOT NULL DEFAULT '',
    "firstSource" TEXT NOT NULL DEFAULT '',
    "firstMedium" TEXT NOT NULL DEFAULT '',
    "firstCampaign" TEXT NOT NULL DEFAULT '',
    "firstLanding" TEXT NOT NULL DEFAULT '',
    "userId" TEXT,
    "booked" BOOLEAN NOT NULL DEFAULT false,
    "bookedAt" DATETIME,
    "visitsToBook" INTEGER
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referrer" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "medium" TEXT NOT NULL DEFAULT '',
    "campaign" TEXT NOT NULL DEFAULT '',
    "landing" TEXT NOT NULL DEFAULT '',
    "exitPath" TEXT NOT NULL DEFAULT '',
    "device" TEXT NOT NULL DEFAULT '',
    "browser" TEXT NOT NULL DEFAULT '',
    "os" TEXT NOT NULL DEFAULT '',
    "screenW" INTEGER,
    "screenH" INTEGER,
    "viewW" INTEGER,
    "viewH" INTEGER,
    "lang" TEXT NOT NULL DEFAULT '',
    "timezone" TEXT NOT NULL DEFAULT '',
    "connection" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "region" TEXT NOT NULL DEFAULT '',
    "consent" TEXT NOT NULL DEFAULT '',
    "ip" TEXT NOT NULL DEFAULT '',
    "userId" TEXT,
    "visitorId" TEXT,
    "visitNo" INTEGER NOT NULL DEFAULT 1,
    "pages" INTEGER NOT NULL DEFAULT 0,
    "events" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "activeSec" INTEGER NOT NULL DEFAULT 0,
    "maxScroll" INTEGER NOT NULL DEFAULT 0,
    "lcp" INTEGER,
    "inp" INTEGER,
    "cls" INTEGER,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "booked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Visit_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Visit" ("booked", "browser", "campaign", "city", "country", "device", "events", "id", "landing", "lastSeenAt", "medium", "pages", "referrer", "screenW", "source", "startedAt", "userId") SELECT "booked", "browser", "campaign", "city", "country", "device", "events", "id", "landing", "lastSeenAt", "medium", "pages", "referrer", "screenW", "source", "startedAt", "userId" FROM "Visit";
DROP TABLE "Visit";
ALTER TABLE "new_Visit" RENAME TO "Visit";
CREATE INDEX "Visit_startedAt_idx" ON "Visit"("startedAt");
CREATE INDEX "Visit_lastSeenAt_idx" ON "Visit"("lastSeenAt");
CREATE INDEX "Visit_userId_idx" ON "Visit"("userId");
CREATE INDEX "Visit_visitorId_idx" ON "Visit"("visitorId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Visitor_lastSeenAt_idx" ON "Visitor"("lastSeenAt");

-- CreateIndex
CREATE INDEX "Visitor_userId_idx" ON "Visitor"("userId");
