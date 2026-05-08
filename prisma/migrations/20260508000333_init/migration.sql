-- CreateTable
CREATE TABLE "Listing" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isFirm" BOOLEAN NOT NULL DEFAULT false,
    "isNonprofit" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "photoUrl" TEXT,
    "firm" TEXT,
    "tagline" TEXT,
    "description" TEXT,
    "streetAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "isNational" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notableResults" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keyCharacteristics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "barNumber" TEXT,
    "website" TEXT,
    "linkedin" TEXT,
    "facebook" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");
