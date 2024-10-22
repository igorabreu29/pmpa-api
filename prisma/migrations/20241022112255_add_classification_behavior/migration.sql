-- DropForeignKey
ALTER TABLE "Classification" DROP CONSTRAINT "Classification_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Classification" DROP CONSTRAINT "Classification_poleId_fkey";

-- DropForeignKey
ALTER TABLE "Classification" DROP CONSTRAINT "Classification_studentId_fkey";

-- CreateTable
CREATE TABLE "ClassificationBehavior" (
    "id" TEXT NOT NULL,
    "classificationId" TEXT NOT NULL,
    "average" DECIMAL(65,30),
    "status" TEXT,
    "behaviors_count" INTEGER NOT NULL,

    CONSTRAINT "ClassificationBehavior_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Classification" ADD CONSTRAINT "Classification_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classification" ADD CONSTRAINT "Classification_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classification" ADD CONSTRAINT "Classification_poleId_fkey" FOREIGN KEY ("poleId") REFERENCES "poles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassificationBehavior" ADD CONSTRAINT "ClassificationBehavior_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "Classification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
