-- AlterTable
ALTER TABLE "accounts" ADD COLUMN "password_hash" TEXT,
ADD COLUMN "username" TEXT,
ADD COLUMN "first_name" TEXT,
ADD COLUMN "last_name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "accounts_username_key" ON "accounts"("username");
