"use client"

import Link from "next/link"
import { Beaker, ChevronRight, FlaskRoundIcon as Flask, Microscope } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface RequestTypeCardProps {
  title: string
  description: string
  icon: "beaker" | "flask" | "microscope"
  href: string
  color: "blue" | "green" | "purple"
}

export default function RequestTypeCard({ title, description, icon, href, color }: RequestTypeCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "beaker":
        return <Beaker className="h-10 w-10" />
      case "flask":
        return <Flask className="h-10 w-10" />
      case "microscope":
        return <Microscope className="h-10 w-10" />
      default:
        return <Beaker className="h-10 w-10" />
    }
  }

  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return {
          iconClass: "text-blue-500",
          bgClass: "bg-blue-50",
          buttonClass: "bg-blue-600 hover:bg-blue-700",
        }
      case "green":
        return {
          iconClass: "text-green-500",
          bgClass: "bg-green-50",
          buttonClass: "bg-green-600 hover:bg-green-700",
        }
      case "purple":
        return {
          iconClass: "text-purple-500",
          bgClass: "bg-purple-50",
          buttonClass: "bg-purple-600 hover:bg-purple-700",
        }
      default:
        return {
          iconClass: "text-blue-500",
          bgClass: "bg-blue-50",
          buttonClass: "bg-blue-600 hover:bg-blue-700",
        }
    }
  }

  const { iconClass, bgClass, buttonClass } = getColorClasses()

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md flex flex-col h-full">
      <CardHeader className={`${bgClass} p-4`}>
        <div className={`${iconClass}`}>{getIcon()}</div>
        <CardTitle className="mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Link href={href} className="w-full">
          <Button
            className={`w-full ${buttonClass}`}
            onClick={() => {
              // Clear all request-related data from localStorage
              if (typeof window !== 'undefined') {
                localStorage.removeItem("ntrFormData");
                localStorage.removeItem("ntrFormData_persistent");
                localStorage.removeItem("ntrSamples");
                localStorage.removeItem("ntrTestMethods");
                localStorage.removeItem("smartAssistantRecommendations");

                // Also clear ASR and ER data for completeness
                localStorage.removeItem("asrFormData");
                localStorage.removeItem("asrSamples");
                localStorage.removeItem("erFormData");
                localStorage.removeItem("erSamples");

                console.log("Cleared all request data from localStorage");
              }
            }}
          >
            Select
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

