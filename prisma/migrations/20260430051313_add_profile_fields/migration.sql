-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "description" TEXT,
ADD COLUMN     "firm" TEXT,
ADD COLUMN     "isNational" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "specialties" TEXT[],
ADD COLUMN     "tagline" TEXT;
