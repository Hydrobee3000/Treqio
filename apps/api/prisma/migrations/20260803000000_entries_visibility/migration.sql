-- CreateEnum
CREATE TYPE "EntriesVisibility" AS ENUM ('PUBLIC', 'FRIENDS', 'PRIVATE');

-- AlterTable: новая колонка добавляется до удаления старой, чтобы перенести
-- значения. Автогенерация Prisma сделала бы drop+create и обнулила настройки
-- всех, кто закрыл профиль.
ALTER TABLE "User" ADD COLUMN "entriesVisibility" "EntriesVisibility" NOT NULL DEFAULT 'PUBLIC';

-- Перенос значений: закрытый профиль означал «видно только друзьям».
UPDATE "User" SET "entriesVisibility" = 'FRIENDS' WHERE "isPublic" = false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isPublic";
