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
    "gclid" TEXT NOT NULL DEFAULT '',
    "term" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
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
INSERT INTO "new_Visit" ("activeSec", "booked", "browser", "campaign", "city", "clicks", "cls", "connection", "consent", "country", "device", "errors", "events", "exitPath", "id", "inp", "ip", "landing", "lang", "lastSeenAt", "lcp", "maxScroll", "medium", "os", "pages", "referrer", "region", "screenH", "screenW", "source", "startedAt", "timezone", "userId", "viewH", "viewW", "visitNo", "visitorId") SELECT "activeSec", "booked", "browser", "campaign", "city", "clicks", "cls", "connection", "consent", "country", "device", "errors", "events", "exitPath", "id", "inp", "ip", "landing", "lang", "lastSeenAt", "lcp", "maxScroll", "medium", "os", "pages", "referrer", "region", "screenH", "screenW", "source", "startedAt", "timezone", "userId", "viewH", "viewW", "visitNo", "visitorId" FROM "Visit";
DROP TABLE "Visit";
ALTER TABLE "new_Visit" RENAME TO "Visit";
CREATE INDEX "Visit_startedAt_idx" ON "Visit"("startedAt");
CREATE INDEX "Visit_lastSeenAt_idx" ON "Visit"("lastSeenAt");
CREATE INDEX "Visit_userId_idx" ON "Visit"("userId");
CREATE INDEX "Visit_visitorId_idx" ON "Visit"("visitorId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
