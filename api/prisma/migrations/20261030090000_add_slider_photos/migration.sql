-- Tambah Slider untuk foto slider beranda (dikelola admin)
CREATE TABLE "Slider" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "pub" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slider_pkey" PRIMARY KEY ("id")
);

-- Urut tampil slider mengikuti sortOrder, lalu waktu dibuat
CREATE INDEX "Slider_sortOrder_createdAt_idx" ON "Slider"("sortOrder" ASC, "createdAt" ASC);
