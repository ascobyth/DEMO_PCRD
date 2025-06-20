"use client"

import { useState } from "react"
import { Star, MessageSquare, Award, ClipboardCheck, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

interface AsrEvaluationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asrId: string
  asrTitle: string
  userEmail?: string
  onEvaluationComplete: () => void
}

export function AsrEvaluationDialog({
  open,
  onOpenChange,
  asrId,
  asrTitle,
  userEmail,
  onEvaluationComplete
}: AsrEvaluationDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [applicabilityScore, setApplicabilityScore] = useState<string>("5")
  const [impacts, setImpacts] = useState<Set<string>>(new Set())
  const [otherImpact, setOtherImpact] = useState("")
  const [satisfactionScore, setSatisfactionScore] = useState<string>("5")
  const [consultationScore, setConsultationScore] = useState<string>("5")
  const [timelinessScore, setTimelinessScore] = useState<string>("5")
  const [additionalComments, setAdditionalComments] = useState("")

  const impactOptions = [
    "Addressed a key problem or input for the project",
    "Provided key fundamental knowledge for future development",
    "Enabled a key decision to move the project forward",
    "Has potential for Intellectual Property (IP) creation (e.g., patent, trade secret)",
    "Positively impacted the overall project speed",
    "Other"
  ]

  const handleImpactChange = (impact: string, checked: boolean) => {
    const newImpacts = new Set(impacts)
    if (checked) {
      newImpacts.add(impact)
    } else {
      newImpacts.delete(impact)
    }
    setImpacts(newImpacts)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      // Prepare evaluation data
      const evaluationData = {
        applicabilityOfResults: parseInt(applicabilityScore),
        positiveImpacts: Array.from(impacts),
        otherImpact: impacts.has("Other") ? otherImpact : undefined,
        overallSatisfaction: parseInt(satisfactionScore),
        researcherConsultation: parseInt(consultationScore),
        timelinessOfService: parseInt(timelinessScore),
        additionalComments: additionalComments.trim(),
        evaluatedBy: userEmail || 'admin@admin.com',
        evaluationDate: new Date().toISOString()
      }

      const response = await fetch(`/api/asrs/${asrId}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          evaluationData,
          userEmail: userEmail || 'admin@admin.com'
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "ASR Evaluation Submitted!",
          description: "Thank you for your feedback. Your evaluation has been recorded.",
          duration: 5000,
        })

        onEvaluationComplete()
        onOpenChange(false)

        // Reset form
        setApplicabilityScore("5")
        setImpacts(new Set())
        setOtherImpact("")
        setSatisfactionScore("5")
        setConsultationScore("5")
        setTimelinessScore("5")
        setAdditionalComments("")
      } else {
        throw new Error(result.error || 'Failed to submit evaluation')
      }
    } catch (error) {
      console.error('Error submitting ASR evaluation:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit evaluation",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderScoreSelector = (value: string, onChange: (value: string) => void, leftLabel: string, rightLabel: string) => (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>(0) {leftLabel}</span>
        <span>(10) {rightLabel}</span>
      </div>
      <RadioGroup value={value} onValueChange={onChange} className="flex justify-between">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
          <div key={score} className="flex flex-col items-center">
            <RadioGroupItem value={score.toString()} id={`score-${score}`} />
            <Label htmlFor={`score-${score}`} className="text-xs mt-1 cursor-pointer">
              {score}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-purple-500" />
            Evaluate ASR Request
          </DialogTitle>
          <DialogDescription>
            Please evaluate the results and impact of this Advanced Service Request
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6 py-4">
            {/* Request Info */}
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="text-sm">
                  <p className="font-medium text-purple-700">ASR ID: {asrId}</p>
                  <p className="text-purple-600 mt-1">Title: {asrTitle}</p>
                </div>
              </CardContent>
            </Card>

            {/* Part 1: Evaluation of Results and Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Part 1: Evaluation of Results and Impact</CardTitle>
                <CardDescription>
                  Please rate the following items on a scale where 0 is the lowest and 10 is the highest.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question 1 */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    1. Applicability of Results
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    The results provided were useful and applicable for problem analysis and resolution.
                  </p>
                  {renderScoreSelector(
                    applicabilityScore,
                    setApplicabilityScore,
                    "Strongly Disagree",
                    "Strongly Agree"
                  )}
                </div>

                <Separator />

                {/* Question 2 */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    2. Positive Impact on the Project
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    In what ways did the solution from this ASR positively impact your project? (Select all that apply)
                  </p>
                  <div className="space-y-2">
                    {impactOptions.map((impact) => (
                      <div key={impact} className="flex items-start space-x-2">
                        <Checkbox
                          id={impact}
                          checked={impacts.has(impact)}
                          onCheckedChange={(checked) => handleImpactChange(impact, checked as boolean)}
                        />
                        <Label
                          htmlFor={impact}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {impact}
                        </Label>
                      </div>
                    ))}
                    {impacts.has("Other") && (
                      <div className="ml-6">
                        <Input
                          placeholder="Please specify..."
                          value={otherImpact}
                          onChange={(e) => setOtherImpact(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Question 3 */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    3. Overall Satisfaction with the Solution
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Based on the impacts selected above, how satisfied are you with the overall solution provided?
                  </p>
                  {renderScoreSelector(
                    satisfactionScore,
                    setSatisfactionScore,
                    "Very Dissatisfied",
                    "Very Satisfied"
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Part 2: Service Evaluation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Part 2: Service Evaluation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question 4 */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    4. Researcher's Consultation
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Satisfaction with the researcher's consultation and recommendations on test methods and analysis.
                  </p>
                  {renderScoreSelector(
                    consultationScore,
                    setConsultationScore,
                    "Very Dissatisfied",
                    "Very Satisfied"
                  )}
                </div>

                <Separator />

                {/* Question 5 */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    5. Timeliness of Service
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Satisfaction with the overall speed of service and delivery of results.
                  </p>
                  {renderScoreSelector(
                    timelinessScore,
                    setTimelinessScore,
                    "Very Dissatisfied",
                    "Very Satisfied"
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Part 3: Additional Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Part 3: Additional Comments & Suggestions</CardTitle>
                <CardDescription>
                  Please provide any other feedback or suggestions for improvement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Share your thoughts, feedback, or suggestions..."
                  value={additionalComments}
                  onChange={(e) => setAdditionalComments(e.target.value)}
                  className="min-h-[100px] resize-none"
                  maxLength={2000}
                />
                <div className="text-xs text-muted-foreground text-right mt-2">
                  {additionalComments.length}/2000 characters
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || impacts.size === 0}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            {submitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Submit Evaluation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}