/*
  Warnings:

  - You are about to drop the `Monitor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_users" DROP CONSTRAINT "_users_A_fkey";

-- DropForeignKey
ALTER TABLE "_users" DROP CONSTRAINT "_users_B_fkey";

-- DropTable
DROP TABLE "Monitor";

-- DropTable
DROP TABLE "_users";
