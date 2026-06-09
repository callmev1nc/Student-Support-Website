import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ResourceListClient } from "./resources-client"

export default async function ResourcesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  })

  return <ResourceListClient resources={resources} />
}
