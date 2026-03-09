-- CreateTable
CREATE TABLE "WebhookSuscription" (
    "id" TEXT NOT NULL,
    "shortUrlID" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookSuscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WebhookSuscription" ADD CONSTRAINT "WebhookSuscription_shortUrlID_fkey" FOREIGN KEY ("shortUrlID") REFERENCES "ShortUrl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
