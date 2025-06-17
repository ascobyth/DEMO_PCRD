"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { Combobox } from "@/components/ui/combobox"

interface RequestFormProps {
  initialData?: any
  onSubmit: (formData: any) => void
  onCancel: () => void
  isLoading: boolean
  isEditing?: boolean
}

export default function RequestForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  isEditing = false
}: RequestFormProps) {
  const [users, setUsers] = useState<any[]>([])
  const [ioNumbers, setIoNumbers] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    requestNumber: "",
    requestStatus: "Pending",
    requestType: "NTR",
    requestDesc: "",
    datapool: "",
    jsonSampleList: "",
    jsonTestingList: "",
    returnSampleAddress: "",
    evaluationScore: 0,
    isAsrRequest: false,
    asrId: "",
    requesterEmail: "",
    ioCostCenter: "",
    requesterCostCenter: "",
    isOnBehalf: false,
    onBehalfOfName: "",
    onBehalfOfEmail: "",
    onBehalfOfCostCenter: "",
    requesterName: "",
    supportStaff: "",
    costSpendingType: "Standard",
    evaluationComment: "",
    receiveDate: "",
    completeDate: "",
    terminateDate: "",
    cancelDate: "",
    returnAddress: "",
    ppcMemberList: "",
    isTechsprint: false
  })

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      // Format dates for form inputs
      const formattedData = {
        ...initialData,
        receiveDate: initialData.receiveDate ? new Date(initialData.receiveDate).toISOString().split('T')[0] : "",
        completeDate: initialData.completeDate ? new Date(initialData.completeDate).toISOString().split('T')[0] : "",
        terminateDate: initialData.terminateDate ? new Date(initialData.terminateDate).toISOString().split('T')[0] : "",
        cancelDate: initialData.cancelDate ? new Date(initialData.cancelDate).toISOString().split('T')[0] : "",
      }
      
      setFormData(formattedData)
    }
  }, [initialData])

  // Fetch users and IO numbers for dropdowns
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        const data = await response.json()
        if (data.success && data.data) {
          setUsers(data.data)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    const fetchIoNumbers = async () => {
      try {
        const response = await fetch('/api/ios')
        const data = await response.json()
        if (data.success && data.data) {
          setIoNumbers(data.data)
        }
      } catch (error) {
        console.error('Error fetching IO numbers:', error)
      }
    }

    fetchUsers()
    fetchIoNumbers()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleNumberChange = (name: string, value: string) => {
    const numValue = value === "" ? 0 : parseFloat(value)
    setFormData((prev) => ({
      ...prev,
      [name]: numValue
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="requestNumber">Request Number</Label>
          <Input
            id="requestNumber"
            name="requestNumber"
            value={formData.requestNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requestStatus">Request Status</Label>
          <Select 
            value={formData.requestStatus} 
            onValueChange={(value) => handleSelectChange("requestStatus", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="InProgress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requestType">Request Type</Label>
          <Select 
            value={formData.requestType} 
            onValueChange={(value) => handleSelectChange("requestType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NTR">Normal Test Request (NTR)</SelectItem>
              <SelectItem value="ASR">Analysis Solution Request (ASR)</SelectItem>
              <SelectItem value="ER">Equipment Reservation (ER)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requesterEmail">Requester Email</Label>
          <Select 
            value={formData.requesterEmail} 
            onValueChange={(value) => handleSelectChange("requesterEmail", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select requester" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user._id} value={user.email}>
                  {user.name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requesterName">Requester Name</Label>
          <Input
            id="requesterName"
            name="requesterName"
            value={formData.requesterName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ioCostCenter">IO Number</Label>
          <Select 
            value={formData.ioCostCenter} 
            onValueChange={(value) => handleSelectChange("ioCostCenter", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select IO number" />
            </SelectTrigger>
            <SelectContent>
              {ioNumbers.map((io) => (
                <SelectItem key={io._id} value={io.ioNo}>
                  {io.ioNo} - {io.ioName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requesterCostCenter">Requester Cost Center</Label>
          <Input
            id="requesterCostCenter"
            name="requesterCostCenter"
            value={formData.requesterCostCenter}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="costSpendingType">Cost Spending Type</Label>
          <Select 
            value={formData.costSpendingType} 
            onValueChange={(value) => handleSelectChange("costSpendingType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select spending type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Premium">Premium</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requestDesc">Request Description</Label>
          <Textarea
            id="requestDesc"
            name="requestDesc"
            value={formData.requestDesc}
            onChange={handleChange}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="datapool">Data Pool</Label>
          <Input
            id="datapool"
            name="datapool"
            value={formData.datapool}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="returnSampleAddress">Return Sample Address</Label>
          <Input
            id="returnSampleAddress"
            name="returnSampleAddress"
            value={formData.returnSampleAddress}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="returnAddress">Return Address</Label>
          <Input
            id="returnAddress"
            name="returnAddress"
            value={formData.returnAddress}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supportStaff">Support Staff</Label>
          <Input
            id="supportStaff"
            name="supportStaff"
            value={formData.supportStaff}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="evaluationScore">Evaluation Score</Label>
          <Input
            id="evaluationScore"
            name="evaluationScore"
            type="number"
            min="0"
            max="10"
            value={formData.evaluationScore.toString()}
            onChange={(e) => handleNumberChange("evaluationScore", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="evaluationComment">Evaluation Comment</Label>
          <Textarea
            id="evaluationComment"
            name="evaluationComment"
            value={formData.evaluationComment}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="receiveDate">Receive Date</Label>
          <Input
            id="receiveDate"
            name="receiveDate"
            type="date"
            value={formData.receiveDate}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="completeDate">Complete Date</Label>
          <Input
            id="completeDate"
            name="completeDate"
            type="date"
            value={formData.completeDate}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="terminateDate">Terminate Date</Label>
          <Input
            id="terminateDate"
            name="terminateDate"
            type="date"
            value={formData.terminateDate}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cancelDate">Cancel Date</Label>
          <Input
            id="cancelDate"
            name="cancelDate"
            type="date"
            value={formData.cancelDate}
            onChange={handleChange}
          />
        </div>

        {formData.requestType === "ASR" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="asrId">ASR ID</Label>
              <Input
                id="asrId"
                name="asrId"
                value={formData.asrId}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2 flex items-center">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isAsrRequest"
                  checked={formData.isAsrRequest}
                  onCheckedChange={(checked) => handleSwitchChange("isAsrRequest", checked)}
                />
                <Label htmlFor="isAsrRequest">Is ASR Request</Label>
              </div>
            </div>
          </>
        )}

        <div className="space-y-2 flex items-center">
          <div className="flex items-center space-x-2">
            <Switch
              id="isOnBehalf"
              checked={formData.isOnBehalf}
              onCheckedChange={(checked) => handleSwitchChange("isOnBehalf", checked)}
            />
            <Label htmlFor="isOnBehalf">On Behalf of Someone</Label>
          </div>
        </div>

        <div className="space-y-2 flex items-center">
          <div className="flex items-center space-x-2">
            <Switch
              id="isTechsprint"
              checked={formData.isTechsprint}
              onCheckedChange={(checked) => handleSwitchChange("isTechsprint", checked)}
            />
            <Label htmlFor="isTechsprint">Is Techsprint</Label>
          </div>
        </div>

        {formData.isOnBehalf && (
          <>
            <div className="space-y-2">
              <Label htmlFor="onBehalfOfName">On Behalf Of Name</Label>
              <Input
                id="onBehalfOfName"
                name="onBehalfOfName"
                value={formData.onBehalfOfName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onBehalfOfEmail">On Behalf Of Email</Label>
              <Input
                id="onBehalfOfEmail"
                name="onBehalfOfEmail"
                value={formData.onBehalfOfEmail}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onBehalfOfCostCenter">On Behalf Of Cost Center</Label>
              <Input
                id="onBehalfOfCostCenter"
                name="onBehalfOfCostCenter"
                value={formData.onBehalfOfCostCenter}
                onChange={handleChange}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{isEditing ? "Update" : "Create"}</>
          )}
        </Button>
      </div>
    </form>
  )
}
