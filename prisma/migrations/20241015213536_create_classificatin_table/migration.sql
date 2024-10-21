-- CreateTable
CREATE TABLE "Classification" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "average" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "behaviorAverage" DECIMAL(65,30) NOT NULL,
    "behaviorStatus" TEXT NOT NULL,

    CONSTRAINT "Classification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Classification_studentId_courseId_idx" ON "Classification"("studentId", "courseId");

-- AddForeignKey
ALTER TABLE "Classification" ADD CONSTRAINT "Classification_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classification" ADD CONSTRAINT "Classification_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
