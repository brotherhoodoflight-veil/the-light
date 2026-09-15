-- AlterTable
-- Historical membership chronology for BOL-1385.
-- The journey began in 2019; formal approval and full membership
-- were recorded in 2026. Year-level fields only — no invented
-- exact dates are ever stored.
ALTER TABLE "Member" ADD COLUMN "journeyStartedYear" INTEGER;
ALTER TABLE "Member" ADD COLUMN "formalApprovalYear" INTEGER;
ALTER TABLE "Member" ADD COLUMN "fullMembershipYear" INTEGER;