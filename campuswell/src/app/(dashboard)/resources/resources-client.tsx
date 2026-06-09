"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, Video, ExternalLink, Search } from "lucide-react"

type Resource = {
  id: string
  title: string
  description: string
  category: string
  url: string
  type: string
  createdAt: string | Date
  author: { name: string }
}

const categories = ["All", "Mental Health", "Study Skills", "Career Advice", "Academic Help", "Emergency"]

const typeIcons: Record<string, React.ElementType> = {
  PDF: FileText,
  VIDEO: Video,
  LINK: ExternalLink,
}

const typeColors: Record<string, string> = {
  PDF: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  VIDEO: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  LINK: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
}

export function ResourceListClient({ resources }: { resources: Resource[] }) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")

  const filtered = resources.filter((r) => {
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === "All" || r.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resource Centre</h1>
        <p className="text-sm text-muted-foreground">
          Helpful resources for your academic and personal wellbeing
        </p>
      </div>

      {/* Search + Filter */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex-wrap h-auto gap-1 bg-transparent">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="data-[state=active]:bg-wsu-red data-[state=active]:text-white"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Resource grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <BookOpen className="mb-4 size-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No resources found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => {
            const TypeIcon = typeIcons[resource.type] || ExternalLink
            const colorClass = typeColors[resource.type] || typeColors.LINK

            return (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="h-full transition-all hover:shadow-md hover:border-wsu-red/30">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                        <TypeIcon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium group-hover:text-wsu-red transition-colors line-clamp-2">
                          {resource.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {resource.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {resource.category}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {resource.type}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
