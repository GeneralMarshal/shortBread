-- CreateIndex
CREATE INDEX "ShortUrl_ownerId_idx" ON "ShortUrl"("ownerId");

-- CreateIndex
CREATE INDEX "UrlClick_shortUrlId_clickedAt_idx" ON "UrlClick"("shortUrlId", "clickedAt");
