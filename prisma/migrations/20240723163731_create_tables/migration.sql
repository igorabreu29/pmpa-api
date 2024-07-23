-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'MANAGER', 'ADMIN', 'DEV');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "isActive" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "isLoginConfirmed" TIMESTAMP(3),
    "birthday" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "userId" TEXT NOT NULL,
    "motherName" TEXT,
    "fatherName" TEXT,
    "civilId" INTEGER NOT NULL,
    "militaryId" INTEGER,
    "state" TEXT,
    "county" TEXT,
    "userIp" TEXT
);

-- CreateTable
CREATE TABLE "UserOnCourse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserOnCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCourseOnPole" (
    "id" TEXT NOT NULL,
    "userOnCourseId" TEXT NOT NULL,
    "poleId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCourseOnPole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPeriod" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseHistoric" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "classname" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "finish_date" TIMESTAMP(3) NOT NULL,
    "speechs" INTEGER,
    "internships" INTEGER,
    "total_hours" INTEGER,
    "division_boss" INTEGER,
    "commander" INTEGER,

    CONSTRAINT "CourseHistoric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses_on_poles" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "poleId" TEXT NOT NULL,

    CONSTRAINT "courses_on_poles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses_on_disciplines" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "module" INTEGER NOT NULL,
    "hours" INTEGER NOT NULL,
    "expected" TEXT NOT NULL,

    CONSTRAINT "courses_on_disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "poles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciplines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "vf" DECIMAL(65,30) NOT NULL,
    "avi" DECIMAL(65,30),
    "avii" DECIMAL(65,30),
    "vfe" DECIMAL(65,30),

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "behaviors" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "january" DECIMAL(65,30),
    "february" DECIMAL(65,30),
    "march" DECIMAL(65,30),
    "april" DECIMAL(65,30),
    "may" DECIMAL(65,30),
    "jun" DECIMAL(65,30),
    "july" DECIMAL(65,30),
    "august" DECIMAL(65,30),
    "september" DECIMAL(65,30),
    "october" DECIMAL(65,30),
    "november" DECIMAL(65,30),
    "decimal" DECIMAL(65,30),
    "currentYear" INTEGER,

    CONSTRAINT "behaviors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE INDEX "UserOnCourse_userId_courseId_idx" ON "UserOnCourse"("userId", "courseId");

-- CreateIndex
CREATE INDEX "courses_on_poles_courseId_poleId_idx" ON "courses_on_poles"("courseId", "poleId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnCourse" ADD CONSTRAINT "UserOnCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnCourse" ADD CONSTRAINT "UserOnCourse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourseOnPole" ADD CONSTRAINT "UserCourseOnPole_userOnCourseId_fkey" FOREIGN KEY ("userOnCourseId") REFERENCES "UserOnCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourseOnPole" ADD CONSTRAINT "UserCourseOnPole_poleId_fkey" FOREIGN KEY ("poleId") REFERENCES "poles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseHistoric" ADD CONSTRAINT "CourseHistoric_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses_on_poles" ADD CONSTRAINT "courses_on_poles_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses_on_poles" ADD CONSTRAINT "courses_on_poles_poleId_fkey" FOREIGN KEY ("poleId") REFERENCES "poles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses_on_disciplines" ADD CONSTRAINT "courses_on_disciplines_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses_on_disciplines" ADD CONSTRAINT "courses_on_disciplines_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "disciplines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "disciplines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behaviors" ADD CONSTRAINT "behaviors_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behaviors" ADD CONSTRAINT "behaviors_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
