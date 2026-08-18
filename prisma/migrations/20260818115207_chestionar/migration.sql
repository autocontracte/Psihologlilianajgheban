-- CreateTable
CREATE TABLE "BriefAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BriefFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storedAs" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "BriefAnswer_key_key" ON "BriefAnswer"("key");

-- CreateIndex
CREATE UNIQUE INDEX "BriefFile_storedAs_key" ON "BriefFile"("storedAs");

-- CreateIndex
CREATE INDEX "BriefFile_key_idx" ON "BriefFile"("key");
