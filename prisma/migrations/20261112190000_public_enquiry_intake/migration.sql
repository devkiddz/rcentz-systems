-- Corporate public submissions become durable enquiries, not financial Quotes.
-- A formal Quote requires authenticated client/service-request records and pricing.
CREATE TABLE "PublicEnquiry" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "projectType" TEXT,
    "budgetNote" TEXT,
    "timeline" TEXT,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'CORPORATE_CONTACT',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notifiedAt" TIMESTAMP(3),
    "consentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PublicEnquiry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PublicEnquiry_reference_key" ON "PublicEnquiry"("reference");
CREATE UNIQUE INDEX "PublicEnquiry_submissionId_key" ON "PublicEnquiry"("submissionId");
CREATE INDEX "PublicEnquiry_purpose_createdAt_idx" ON "PublicEnquiry"("purpose", "createdAt");
CREATE INDEX "PublicEnquiry_status_createdAt_idx" ON "PublicEnquiry"("status", "createdAt");
CREATE INDEX "PublicEnquiry_email_createdAt_idx" ON "PublicEnquiry"("email", "createdAt");
