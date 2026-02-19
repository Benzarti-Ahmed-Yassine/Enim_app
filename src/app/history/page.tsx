
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { generateDailyMockData, TemperatureReading } from "@/lib/temp-data"
import { Calendar as CalendarIcon, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react"
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"

export default function HistoryPage() {
  const { firestore } = useFirestore()
  const { user } = useUser()
  
  const [data, setData] = useState<TemperatureReading[]>([])
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Récupération du seuil réel pour l'affichage du statut
  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return doc(firestore, "users", user.uid, "settings")
  }, [firestore, user])

  const { data: settings } = useDoc(settingsRef)
  const threshold = settings?.temperatureThreshold || 30

  useEffect(() => {
    const rawData = generateDailyMockData()
    sortData(rawData, "desc")
  }, [])

  const sortData = (items: TemperatureReading[], order: "asc" | "desc") => {
    const sorted = [...items].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return order === "desc" ? timeB - timeA : timeA - timeB
    })
    setData(sorted)
  }

  const toggleSort = () => {
    const nextOrder = sortOrder === "asc" ? "desc" : "asc"
    setSortOrder(nextOrder)
    sortData(data, nextOrder)
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
           <CalendarIcon className="w-6 h-6 text-primary" />
           <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Log History</h1>
        </div>
        <p className="text-muted-foreground">Historical records of sensor readings for the last 24 hours.</p>
      </header>

      <Card className="border-none shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Readings</CardTitle>
            <CardDescription>Detailed timestamp log</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleSort}
            className="gap-2"
          >
            {sortOrder === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            {sortOrder === "desc" ? "Plus récents" : "Plus anciens"}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {new Date(item.timestamp).toLocaleTimeString()}
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-lg">
                    {item.value.toFixed(1)}°C
                  </TableCell>
                  <TableCell>
                    {item.value > threshold ? (
                      <Badge className="bg-accent hover:bg-accent/80 text-white border-none">
                        Exceeded
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                        Normal
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
