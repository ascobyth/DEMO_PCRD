import { ChevronLeft, Filter, Plus, Search } from "lucide-react"
import Link from "next/link"
import RequestCard from "@/components/request-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RequestsPage() {
  // Sample data for demonstration
  const requests = [
    {
      id: "1234",
      title: "Solar Panel Maintenance",
      description: "Maintenance request for the solar panel located in the northern sector.",
      status: "pending" as const,
      createdAt: "03/15/2025",
      assignee: {
        name: "John Doe",
        initials: "JD",
        avatarColor: "blue",
      },
    },
    {
      id: "1235",
      title: "Monitoring Equipment Installation",
      description: "Installation of new monitoring equipment in the wind power plant.",
      status: "approved" as const,
      createdAt: "03/14/2025",
      assignee: {
        name: "Mary Rodriguez",
        initials: "MR",
        avatarColor: "green",
      },
    },
    {
      id: "1236",
      title: "Location Change",
      description: "Request to change the location for the solar energy project in the southern zone.",
      status: "rejected" as const,
      createdAt: "03/13/2025",
      assignee: {
        name: "Charles Lopez",
        initials: "CL",
        avatarColor: "purple",
      },
    },
    {
      id: "1237",
      title: "Software Update",
      description: "Update of control software for renewable energy systems.",
      status: "in-progress" as const,
      createdAt: "03/12/2025",
      assignee: {
        name: "Anna Martinez",
        initials: "AM",
        avatarColor: "orange",
      },
    },
    {
      id: "1238",
      title: "Turbine Repair",
      description: "Urgent repair of turbine #3 in the main wind farm.",
      status: "completed" as const,
      createdAt: "03/11/2025",
      assignee: {
        name: "Peter Smith",
        initials: "PS",
        avatarColor: "red",
      },
    },
    {
      id: "1239",
      title: "Performance Evaluation",
      description: "Performance evaluation of solar panels installed last month.",
      status: "pending" as const,
      createdAt: "03/10/2025",
      assignee: {
        name: "Laura Garcia",
        initials: "LG",
        avatarColor: "pink",
      },
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-blue-500" />
              <div className="absolute inset-[2px] rounded-full bg-white" />
              <div className="absolute inset-[4px] rounded-full bg-gradient-to-r from-green-400 to-blue-400" />
            </div>
            <span className="text-xl font-bold">PCRD Smart Request</span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 container py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Requests</h1>
            <p className="text-muted-foreground mt-1">Manage and view all your requests in one place</p>
          </div>
          <Link href="/request/new">
            <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
              <Plus className="mr-2 h-4 w-4" />
              Create New Request
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search requests..." className="pl-10 bg-background" />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              id={request.id}
              title={request.title}
              description={request.description}
              status={request.status}
              createdAt={request.createdAt}
              assignee={request.assignee}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </main>
      <footer className="w-full border-t bg-background py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-blue-500" />
              <div className="absolute inset-[1.5px] rounded-full bg-white" />
              <div className="absolute inset-[3px] rounded-full bg-gradient-to-r from-green-400 to-blue-400" />
            </div>
            <span className="text-lg font-bold">PCRD Smart Request</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} PCRD Smart Request. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

