-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('STUDENTS', 'MONITOR', 'ADMIN', 'SUPERADMIN');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "heure" INTEGER NOT NULL,
    "heuresup" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "forfaitId" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Forfait" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "heure" INTEGER NOT NULL,

    CONSTRAINT "Forfait_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_forfaitId_fkey" FOREIGN KEY ("forfaitId") REFERENCES "Forfait"("id") ON DELETE SET NULL ON UPDATE CASCADE;
