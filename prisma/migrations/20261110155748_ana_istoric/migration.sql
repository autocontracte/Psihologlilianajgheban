-- CreateTable
CREATE TABLE "AnaChat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "visitId" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "intrebari" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "AnaMesaj" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnaMesaj_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "AnaChat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AnaChat_key_key" ON "AnaChat"("key");

-- CreateIndex
CREATE INDEX "AnaChat_lastAt_idx" ON "AnaChat"("lastAt");

-- CreateIndex
CREATE INDEX "AnaChat_visitId_idx" ON "AnaChat"("visitId");

-- CreateIndex
CREATE INDEX "AnaMesaj_chatId_at_idx" ON "AnaMesaj"("chatId", "at");
