"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { collection, query, where, getDocs, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Droplets, User, Weight, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RequestBloodProps {
  hospitalData: any
}

export default function RequestBlood({ hospitalData }: RequestBloodProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("")
  const [donors, setDonors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [unitsRequired, setUnitsRequired] = useState("")

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  const fetchDonors = async (bloodGroup: string) => {
    setLoading(true)
    try {
      const q = query(
        collection(db, "donordetails"),
        where("bloodGroup", "==", bloodGroup),
        where("available", "==", true),
        where("eligible", "==", true),
      )

      const querySnapshot = await getDocs(q)
      const donorsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setDonors(donorsData)
    } catch (error) {
      console.error("Error fetching donors:", error)
      toast({
        title: "Error",
        description: "Failed to fetch donors. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBloodGroupSelect = (bloodGroup: string) => {
    setSelectedBloodGroup(bloodGroup)
    fetchDonors(bloodGroup)
    setUnitsRequired("")
  }

  const handleRequestBlood = async () => {
    if (!user || !hospitalData || !selectedBloodGroup || !unitsRequired) return

    setRequesting(true)
    try {
      const requestPromises = donors.map(async (donor) => {
        const requestData = {
          hospitalId: user.uid,
          donorId: donor.id,
          bloodGroup: selectedBloodGroup,
          unitsRequired: Number.parseInt(unitsRequired),
          hospitalName: hospitalData.hospitalName || "Hospital",
          hospitalPhone: hospitalData.phone || "",
          hospitalEmail: user.email || "",
          hospitalCity: hospitalData.city || "",
          hospitalState: hospitalData.state || "",
          hospitalCountry: hospitalData.country || "",
          hospitalPincode: hospitalData.pincode || 0,
          status: "pending",
          createdAt: new Date(),
        }

        await addDoc(collection(db, "requests"), requestData)

        await addDoc(collection(db, "notifications"), {
          donorId: donor.id,
          hospitalId: user.uid,
          type: "blood_request",
          message: `Blood request from ${hospitalData.hospitalName || "Hospital"}`,
          bloodGroup: selectedBloodGroup,
          unitsRequired: Number.parseInt(unitsRequired),
          createdAt: new Date(),
          read: false,
        })
      })

      await Promise.all(requestPromises)
      setUnitsRequired("")

      toast({
        title: "Request Sent Successfully!",
        description: `Blood request sent to ${donors.length} eligible donors.`,
      })
    } catch (error) {
      console.error("Error sending blood request:", error)
      toast({
        title: "Error",
        description: "Failed to send blood request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Request Blood</h2>
        <p className="text-slate-600">Find and request blood from eligible donors</p>
      </div>

      {/* Blood Group and Units Selection */}
      <Card className="shadow-sm border-slate-200 bg-white">
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="w-full md:w-48">
              <Label htmlFor="bloodGroup" className="text-lg font-semibold text-slate-800">
                Blood Group
              </Label>
              <Select value={selectedBloodGroup} onValueChange={handleBloodGroupSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="units" className="text-lg font-semibold text-slate-800">
                Units Required
              </Label>
              <Input
                id="units"
                type="number"
                min="1"
                value={unitsRequired}
                onChange={(e) => setUnitsRequired(e.target.value)}
                placeholder="Enter units"
              />
            </div>
            <Button
              onClick={handleRequestBlood}
              disabled={requesting || !selectedBloodGroup || !unitsRequired || donors.length === 0}
              className="bg-sky-600 hover:bg-sky-700 w-full md:w-auto"
            >
              {requesting ? "Sending..." : "Request Blood"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Donors List */}
      {selectedBloodGroup && (
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Available Donors</CardTitle>
            <CardDescription>
              {loading ? "Loading donors..." : `${donors.length} eligible donors found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading eligible donors...</div>
            ) : donors.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No eligible donors found for blood group {selectedBloodGroup}. Only donors who meet all eligibility
                  criteria are shown here.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4">
                {donors.map((donor) => (
                  <Card key={donor.id} className="border-l-4 border-l-sky-500 bg-slate-50">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <Droplets className="h-4 w-4 text-sky-600" />
                          <div>
                            <p className="text-xs text-slate-500">Blood Group</p>
                            <p className="font-semibold text-sky-600">{donor.bloodGroup}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-500">Age</p>
                            <p className="font-semibold">{donor.age} years</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Weight className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-500">Weight</p>
                            <p className="font-semibold">{donor.weight} kg</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-500">Health Status</p>
                            <Badge variant="secondary" className="capitalize">
                              {donor.healthCondition}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
