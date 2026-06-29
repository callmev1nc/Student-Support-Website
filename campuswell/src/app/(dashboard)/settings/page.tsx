import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { SettingsClient } from "./settings-client"

export default async function SettingsPage() {
  const { userId } = await requireUser()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, bio: true, avatarUrl: true },
  })

  return (
    <SettingsClient
      initialName={user?.name ?? ""}
      initialEmail={user?.email ?? ""}
      initialBio={user?.bio ?? ""}
      initialAvatarUrl={user?.avatarUrl ?? ""}
    />
  )
}
