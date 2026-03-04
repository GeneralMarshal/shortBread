-- CreateTable
CREATE TABLE "UrlClick" (
    "id" TEXT NOT NULL,
    "shortUrlId" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referrer" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "country" TEXT,

    CONSTRAINT "UrlClick_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UrlClick" ADD CONSTRAINT "UrlClick_shortUrlId_fkey" FOREIGN KEY ("shortUrlId") REFERENCES "ShortUrl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
