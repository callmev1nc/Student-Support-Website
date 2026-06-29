import { requireRole } from "@/lib/session"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Ticket, CheckCircle2, Clock, Users, BarChart3 } from "lucide-react"
import { AnalyticsCharts } from "@/components/analytics-charts-wrapper"

// Demo data for charts
const monthlyTickets = [
  { month: "Jan", tickets: 12 },
  { month: "Feb", tickets: 19 },
  { month: "Mar", tickets: 15 },
  { month: "Apr", tickets: 22 },
  { month: "May", tickets: 28 },
  { month: "Jun", tickets: 18 },
]

const ticketsByCategory = [
  { name: "Academic", value: 35, fill: "#DC2626" },
  { name: "Mental Health", value: 28, fill: "#F87171" },
  { name: "Technical", value: 18, fill: "#60A5FA" },
  { name: "Bullying", value: 8, fill: "#FBBF24" },
  { name: "Attendance", value: 12, fill: "#4ADE80" },
  { name: "Financial", value: 15, fill: "#C084FC" },
  { name: "General", value: 22, fill: "#94A3B8" },
]

const staffWorkload = [
  { name: "Dr. Sarah Smith", role: "Counsellor", active: 8, resolved: 24, avgHours: "4.2h" },
  { name: "James Miller", role: "Academic Advisor", active: 12, resolved: 18, avgHours: "5.1h" },
  { name: "Lisa Chen", role: "Wellbeing Officer", active: 6, resolved: 21, avgHours: "3.8h" },
]

export default async function AnalyticsPage() {
  await requireRole("ADMIN")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Platform-wide statistics and insights
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-wsu-red/10 text-wsu-red">
              <Ticket className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">156</p>
              <p className="text-xs text-muted-foreground">Total Tickets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">73%</p>
              <p className="text-xs text-muted-foreground">Resolved Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">4.3h</p>
              <p className="text-xs text-muted-foreground">Avg Response Time</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">284</p>
              <p className="text-xs text-muted-foreground">Active Users</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <AnalyticsCharts
        monthlyTickets={monthlyTickets}
        ticketsByCategory={ticketsByCategory}
      />

      {/* Staff workload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-4" />
            Staff Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Active Cases</TableHead>
                <TableHead className="text-center">Resolved</TableHead>
                <TableHead className="text-center">Avg Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffWorkload.map((staff) => (
                <TableRow key={staff.name}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{staff.role}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{staff.active}</TableCell>
                  <TableCell className="text-center">{staff.resolved}</TableCell>
                  <TableCell className="text-center">{staff.avgHours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
