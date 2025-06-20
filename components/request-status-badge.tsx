import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, Clock3 } from "lucide-react";

interface RequestStatusBadgeProps {
  status: string;
}

function RequestStatusBadgeComponent({ status }: RequestStatusBadgeProps) {
  // Handle undefined or null status
  if (!status) {
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">
        Unknown
      </Badge>
    );
  }
  
  switch (status.toLowerCase()) {
    case "pending receive sample":
    case "pending receive":
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-300 flex items-center gap-1 font-medium"
        >
          <Clock3 className="h-3 w-3" /> Pending Receive Sample
        </Badge>
      );
    case "in-progress":
    case "in progress":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-300 flex items-center gap-1 font-medium"
        >
          <Clock className="h-3 w-3" /> In Progress
        </Badge>
      );
    case "completed":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-300 flex items-center gap-1 font-medium"
        >
          <CheckCircle2 className="h-3 w-3" /> Completed
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-300 flex items-center gap-1 font-medium"
        >
          <XCircle className="h-3 w-3" /> Rejected
        </Badge>
      );
    case "terminated":
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-700 border-gray-300 flex items-center gap-1 font-medium"
        >
          <XCircle className="h-3 w-3" /> TERMINATED
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export { RequestStatusBadgeComponent as RequestStatusBadge };
export default RequestStatusBadgeComponent;