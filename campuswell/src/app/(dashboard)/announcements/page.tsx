import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pin, Megaphone } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

export default async function AnnouncementsPage() {
  const { role } = await requireUser()

  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    include: { author: { select: { name: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-sm text-muted-foreground">
            Important updates and notices
          </p>
        </div>
        {role === "ADMIN" && (
          <Button variant="outline" onClick={() => { toast.info("Coming soon — announcement creation") }}>
            <Megaphone className="mr-2 size-4" />
            Create Announcement
          </Button>
        )}
      </div>

      {announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Megaphone className="mb-4 size-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No announcements</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back later for updates
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className={
                announcement.pinned
                  ? "border-wsu-red/30 bg-wsu-red/[0.02] dark:bg-wsu-red/[0.05]"
                  : ""
              }
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  {announcement.pinned && (
                    <Pin className="mt-0.5 size-4 shrink-0 text-wsu-red" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">{announcement.title}</h3>
                      {announcement.pinned && (
                        <Badge className="bg-wsu-red text-white text-[10px]">Pinned</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>By {announcement.author.name}</span>
                      <span>&middot;</span>
                      <span>
                        {formatDistanceToNow(new Date(announcement.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
