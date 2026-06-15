-- CreateIndex
CREATE INDEX "Guide_published_idx" ON "Guide"("published");

-- CreateIndex
CREATE INDEX "Guide_published_featured_idx" ON "Guide"("published", "featured");

-- CreateIndex
CREATE INDEX "Listing_approved_idx" ON "Listing"("approved");

-- CreateIndex
CREATE INDEX "Listing_approved_state_idx" ON "Listing"("approved", "state");

-- CreateIndex
CREATE INDEX "ClickEvent_listingSlug_idx" ON "ClickEvent"("listingSlug");

-- CreateIndex
CREATE INDEX "ContactLead_listingSlug_idx" ON "ContactLead"("listingSlug");

-- CreateIndex
CREATE INDEX "ContactLead_createdAt_idx" ON "ContactLead"("createdAt");
