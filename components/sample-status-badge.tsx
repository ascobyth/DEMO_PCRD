import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertTriangle, ArrowUpDown, Beaker } from "lucide-react";

interface SampleStatusBadgeProps {
  status: string;
}

export function SampleStatusBadge({ status }: SampleStatusBadgeProps) {
  switch (status) {
    case "Pending Receive":
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 flex items-center gap-1 font-medium">
          <Clock className="h-3 w-3" /> Pending Receive
        </Badge>
      );
    case "Received":
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 flex items-center gap-1 font-medium">
          <CheckCircle className="h-3 w-3" /> Received
        </Badge>
      );
    case "In Queue":
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-300 flex items-center gap-1 font-medium">
          <Clock className="h-3 w-3" /> In Queue
        </Badge>
      );
    case "In Testing":
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-400 flex items-center gap-1 font-medium">
          <Beaker className="h-3 w-3" /> In Testing
        </Badge>
      );
    case "Testing Completed":
      return (
        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-300 flex items-center gap-1 font-medium">
          <CheckCircle className="h-3 w-3" /> Testing Completed
        </Badge>
      );
    case "Result Analysis":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 flex items-center gap-1 font-medium">
          <ArrowUpDown className="h-3 w-3" /> Result Analysis
        </Badge>
      );
    case "Verified":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 flex items-center gap-1 font-medium">
          <CheckCircle className="h-3 w-3" /> Verified
        </Badge>
      );
    case "Rejected":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 flex items-center gap-1 font-medium">
          <XCircle className="h-3 w-3" /> Rejected
        </Badge>
      );
    case "Insufficient":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 flex items-center gap-1 font-medium">
          <AlertTriangle className="h-3 w-3" /> Insufficient
        </Badge>
      );
    case "Contaminated":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-300 flex items-center gap-1 font-medium">
          <AlertTriangle className="h-3 w-3" /> Contaminated
        </Badge>
      );
    case "Returned":
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 flex items-center gap-1 font-medium">
          <ArrowUpDown className="h-3 w-3" /> Returned
        </Badge>
      );
    case "Disposed":
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 flex items-center gap-1 font-medium">
          <ArrowUpDown className="h-3 w-3" /> Disposed
        </Badge>
      );
    case "On Hold":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-orange-700 border-yellow-300 flex items-center gap-1 font-medium">
          <Clock className="h-3 w-3" /> On Hold
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
