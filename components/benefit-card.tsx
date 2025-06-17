import { Check, Eye, Leaf, Map, PenToolIcon as Tool } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface BenefitCardProps {
  title: string
  description: string
  icon: "map" | "eye" | "tool" | "leaf"
}

export default function BenefitCard({ title, description, icon }: BenefitCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "map":
        return <Map className="h-10 w-10 text-green-500" />
      case "eye":
        return <Eye className="h-10 w-10 text-blue-500" />
      case "tool":
        return <Tool className="h-10 w-10 text-green-500" />
      case "leaf":
        return <Leaf className="h-10 w-10 text-blue-500" />
      default:
        return <Check className="h-10 w-10 text-green-500" />
    }
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="font-bold">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

