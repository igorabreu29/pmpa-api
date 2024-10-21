/*
  Warnings:

  - You are about to drop the column `behaviorAverage` on the `Classification` table. All the data in the column will be lost.
  - You are about to drop the column `behaviorStatus` on the `Classification` table. All the data in the column will be lost.
  - Added the required column `assessmentsCount` to the `Classification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `behaviorAverageModule1` to the `Classification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `behaviorAverageModule2` to the `Classification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `behaviorAverageModule3` to the `Classification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `behaviorStatusModule1` to the `Classification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `behaviorStatusModule2` to the `Classification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `behaviorStatusModule3` to the `Classification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `poleId` to the `Classification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Classification" DROP COLUMN "behaviorAverage",
DROP COLUMN "behaviorStatus",
ADD COLUMN     "assessmentsCount" INTEGER NOT NULL,
ADD COLUMN     "behaviorAverageModule1" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "behaviorAverageModule2" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "behaviorAverageModule3" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "behaviorStatusModule1" TEXT NOT NULL,
ADD COLUMN     "behaviorStatusModule2" TEXT NOT NULL,
ADD COLUMN     "behaviorStatusModule3" TEXT NOT NULL,
ADD COLUMN     "poleId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Classification" ADD CONSTRAINT "Classification_poleId_fkey" FOREIGN KEY ("poleId") REFERENCES "poles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
