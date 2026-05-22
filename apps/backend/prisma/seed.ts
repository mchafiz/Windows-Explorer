import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const documents = await prisma.folder.create({ data: { name: 'Documents' } })
  const pictures  = await prisma.folder.create({ data: { name: 'Pictures' } })
  const videos    = await prisma.folder.create({ data: { name: 'Videos' } })

  const work     = await prisma.folder.create({ data: { name: 'Work',     parentId: documents.id } })
  const personal = await prisma.folder.create({ data: { name: 'Personal', parentId: documents.id } })

  await prisma.folder.createMany({
    data: [
      { name: 'Projects', parentId: work.id },
      { name: 'Reports',  parentId: work.id },
      { name: 'Holidays', parentId: pictures.id },
      { name: 'Family',   parentId: pictures.id },
      { name: 'Lectures', parentId: videos.id },
    ],
  })

  await prisma.file.createMany({
    data: [
      { name: 'resume.pdf',    folderId: documents.id, mimeType: 'application/pdf',              size: 245_000 },
      { name: 'budget.xlsx',   folderId: work.id,      mimeType: 'application/vnd.ms-excel',     size: 48_000 },
      { name: 'vacation.jpg',  folderId: pictures.id,  mimeType: 'image/jpeg',                   size: 3_200_000 },
      { name: 'portrait.png',  folderId: personal.id,  mimeType: 'image/png',                    size: 1_500_000 },
      { name: 'lecture01.mp4', folderId: videos.id,    mimeType: 'video/mp4',                    size: 450_000_000 },
    ],
  })

  console.log('✅ Seed complete')
}

main().catch(console.error).finally(() => prisma.$disconnect())
