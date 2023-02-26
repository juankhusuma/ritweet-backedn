/*
  Warnings:

  - You are about to alter the column `body` on the `Tweet` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1024)`.

*/
-- AlterTable
ALTER TABLE "Tweet" ALTER COLUMN "body" SET DATA TYPE VARCHAR(1024);
