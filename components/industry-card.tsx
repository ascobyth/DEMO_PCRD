import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface IndustryCardProps {
  title: string
  description: string
  image: string
}

export default function IndustryCard({ title, description, image }: IndustryCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" size="sm" className="w-full">
          Saber más
        </Button>
      </CardFooter>
    </Card>
  )
}

