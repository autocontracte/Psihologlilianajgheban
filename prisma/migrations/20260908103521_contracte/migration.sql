-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "sentToName" TEXT NOT NULL,
    "sentToEmail" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "userId" TEXT,
    "appointmentId" TEXT,
    "data" TEXT,
    "signature1" TEXT,
    "signature2" TEXT,
    "pdfPath" TEXT,
    "pdfHash" TEXT,
    "signedIp" TEXT,
    "signedAgent" TEXT,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Contract_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Contract_token_key" ON "Contract"("token");

-- CreateIndex
CREATE INDEX "Contract_status_idx" ON "Contract"("status");

-- CreateIndex
CREATE INDEX "Contract_sentToEmail_idx" ON "Contract"("sentToEmail");

-- CreateIndex
CREATE INDEX "Contract_userId_idx" ON "Contract"("userId");
