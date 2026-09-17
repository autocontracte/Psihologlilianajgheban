-- CreateTable
CREATE TABLE "GuideOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "email" TEXT,
    "answers" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'STARTED',
    "amount" INTEGER NOT NULL DEFAULT 5000,
    "currency" TEXT NOT NULL DEFAULT 'RON',
    "interpretation" TEXT,
    "paymentRef" TEXT,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GuideOrder_token_key" ON "GuideOrder"("token");

-- CreateIndex
CREATE INDEX "GuideOrder_status_idx" ON "GuideOrder"("status");

-- CreateIndex
CREATE INDEX "GuideOrder_email_idx" ON "GuideOrder"("email");
