/*
  Warnings:

  - You are about to drop the column `nextStatus` on the `TaskHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TaskHistory" DROP COLUMN "nextStatus",
ADD COLUMN     "currentStatus" "Status" NOT NULL DEFAULT 'ToDo',
ALTER COLUMN "previousStatus" DROP NOT NULL;
