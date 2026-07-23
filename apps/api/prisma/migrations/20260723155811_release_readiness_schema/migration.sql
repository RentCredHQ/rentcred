-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "bundle_id" TEXT,
ADD COLUMN     "price_ngn" INTEGER,
ADD COLUMN     "submission_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- Normalize tenant emails so submission <-> tenant joins stop depending on the
-- casing an agent happened to type. Application code lowercases on write from
-- this release onward; this backfills everything written before it.
UPDATE "submissions" SET "tenant_email" = LOWER(TRIM("tenant_email"));

-- These four columns held bare user ids with no foreign key behind them, so
-- nothing ever validated their contents. assigned_ops_id in particular has no
-- writer anywhere in the codebase, meaning any value present is legacy or was
-- inserted by hand. Null out anything that does not resolve to a real user,
-- otherwise adding the constraints below fails and takes the deploy with it.
UPDATE "submissions" SET "assigned_ops_id" = NULL
  WHERE "assigned_ops_id" IS NOT NULL
    AND "assigned_ops_id" NOT IN (SELECT "id" FROM "users");
UPDATE "reports" SET "approved_by" = NULL
  WHERE "approved_by" IS NOT NULL
    AND "approved_by" NOT IN (SELECT "id" FROM "users");
UPDATE "kyb_applications" SET "reviewed_by" = NULL
  WHERE "reviewed_by" IS NOT NULL
    AND "reviewed_by" NOT IN (SELECT "id" FROM "users");
UPDATE "disputes" SET "resolved_by" = NULL
  WHERE "resolved_by" IS NOT NULL
    AND "resolved_by" NOT IN (SELECT "id" FROM "users");

-- price_ngn is intentionally left NULL on pre-existing rows: those transactions
-- predate the column and their naira price cannot be derived (amount holds
-- credits, and there was no bundle link). Webhook reconciliation treats a NULL
-- price as "cannot verify" and credits the purchase rather than withholding it.

-- CreateIndex
CREATE INDEX "disputes_resolved_by_idx" ON "disputes"("resolved_by");

-- CreateIndex
CREATE INDEX "kyb_applications_reviewed_by_idx" ON "kyb_applications"("reviewed_by");

-- CreateIndex
CREATE INDEX "reports_approved_by_idx" ON "reports"("approved_by");

-- CreateIndex
CREATE INDEX "submissions_assigned_ops_id_idx" ON "submissions"("assigned_ops_id");

-- CreateIndex
CREATE INDEX "transactions_submission_id_idx" ON "transactions"("submission_id");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_assigned_ops_id_fkey" FOREIGN KEY ("assigned_ops_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "credit_bundles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyb_applications" ADD CONSTRAINT "kyb_applications_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
