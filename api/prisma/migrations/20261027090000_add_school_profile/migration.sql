-- Tambah SchoolProfile untuk data identitas sekolah (dikelola admin)
CREATE TABLE "SchoolProfile" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL,
    "npsn" TEXT NOT NULL DEFAULT '',
    "addr" TEXT NOT NULL DEFAULT '',
    "telp" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "ppdb" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolProfile_pkey" PRIMARY KEY ("id")
);
