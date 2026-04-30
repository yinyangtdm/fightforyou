-- Add featured column
ALTER TABLE "Listing" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;

-- Convert practiceAreas: comma-separated text → text[]
ALTER TABLE "Listing" ALTER COLUMN "practiceAreas" TYPE TEXT[]
  USING CASE
    WHEN "practiceAreas" IS NULL OR trim("practiceAreas") = '' THEN '{}'::TEXT[]
    ELSE string_to_array("practiceAreas", ',')
  END;
ALTER TABLE "Listing" ALTER COLUMN "practiceAreas" SET NOT NULL;
ALTER TABLE "Listing" ALTER COLUMN "practiceAreas" SET DEFAULT '{}';

-- Convert notableResults: text → text[] (existing JSON strings converted to empty array; data re-entered via forms)
ALTER TABLE "Listing" ALTER COLUMN "notableResults" TYPE TEXT[] USING '{}'::TEXT[];
ALTER TABLE "Listing" ALTER COLUMN "notableResults" SET NOT NULL;
ALTER TABLE "Listing" ALTER COLUMN "notableResults" SET DEFAULT '{}';

-- Convert keyCharacteristics: text → text[]
ALTER TABLE "Listing" ALTER COLUMN "keyCharacteristics" TYPE TEXT[] USING '{}'::TEXT[];
ALTER TABLE "Listing" ALTER COLUMN "keyCharacteristics" SET NOT NULL;
ALTER TABLE "Listing" ALTER COLUMN "keyCharacteristics" SET DEFAULT '{}';
