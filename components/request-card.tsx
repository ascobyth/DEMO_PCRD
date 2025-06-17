import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RequestStatusBadge from "@/components/request-status-badge"

interface RequestCardProps {
  id: string
  title: string
  description: string
  status: "pending" | "approved" | "rejected" | "in-progress" | "completed"
  createdAt: string
  assignee: {
    name: string
    initials: string
    avatarColor: string
  }
}

export default function RequestCard({ id, title, description, status, createdAt, assignee }: RequestCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-4 pb-2 flex justify-between items-start">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Solicitud #{id} • {createdAt}
          </CardDescription>
        </div>
        <RequestStatusBadge status={status} />
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full bg-${assignee.avatarColor}-100 flex items-center justify-center`}>
              <span className={`text-xs font-medium text-${assignee.avatarColor}-700`}>{assignee.initials}</span>
            </div>
            <span className="text-sm">{assignee.name}</span>
          </div>
          <Button variant="outline" size="sm">
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

