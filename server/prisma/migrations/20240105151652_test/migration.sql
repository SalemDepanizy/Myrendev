/*
  Warnings:

  - You are about to drop the column `brand` on the `Vehicule` table. All the data in the column will be lost.
  - You are about to drop the column `heuresup` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `vehiculeId` on the `user` table. All the data in the column will be lost.
  - Added the required column `numberOfPeople` to the `Forfait` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectMorePeople` to the `Forfait` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Vehicule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleBrand` to the `Vehicule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehiculeType` to the `Vehicule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ownership" DROP CONSTRAINT "Ownership_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Ownership" DROP CONSTRAINT "Ownership_userId_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_vehiculeId_fkey";

-- AlterTable
ALTER TABLE "Forfait" ADD COLUMN     "numberOfPeople" INTEGER NOT NULL,
ADD COLUMN     "ownershipId" TEXT,
ADD COLUMN     "selectMorePeople" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Ownership" ADD COLUMN     "forfaitId" TEXT,
ADD COLUMN     "vehiculeId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Vehicule" DROP COLUMN "brand",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "ownershipId" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD COLUMN     "vehicleBrand" TEXT NOT NULL,
ADD COLUMN     "vehiculeType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "heuresup",
DROP COLUMN "vehiculeId",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "codePostal" TEXT,
ADD COLUMN     "name_entreprise" TEXT,
ADD COLUMN     "name_manager" TEXT,
ADD COLUMN     "phone_entreprise" TEXT,
ADD COLUMN     "resetPasswordExpiry" DOUBLE PRECISION,
ADD COLUMN     "resetPasswordToken" TEXT,
ADD COLUMN     "ville" TEXT;

-- CreateTable
CREATE TABLE "RendezVous" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "clientId" TEXT NOT NULL,
    "forfaitId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "RendezVous_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "rendezVousId" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,
    "monitorId" TEXT NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Satisfaction" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "question" TEXT,
    "redirect_url" TEXT,
    "redirect_grade" INTEGER,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Satisfaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ownership" ADD CONSTRAINT "Ownership_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ownership" ADD CONSTRAINT "Ownership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ownership" ADD CONSTRAINT "Ownership_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ownership" ADD CONSTRAINT "Ownership_forfaitId_fkey" FOREIGN KEY ("forfaitId") REFERENCES "Forfait"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicule" ADD CONSTRAINT "Vehicule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RendezVous" ADD CONSTRAINT "RendezVous_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RendezVous" ADD CONSTRAINT "RendezVous_forfaitId_fkey" FOREIGN KEY ("forfaitId") REFERENCES "Forfait"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RendezVous" ADD CONSTRAINT "RendezVous_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Ownership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_rendezVousId_fkey" FOREIGN KEY ("rendezVousId") REFERENCES "RendezVous"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Satisfaction" ADD CONSTRAINT "Satisfaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
