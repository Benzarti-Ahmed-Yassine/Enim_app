
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ChevronUp, ChevronDown, Loader2, Database } from "lucide-react"
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, collection, query, orderBy } from "firebase/firestore"

export default function HistoryPage() {
  const firestore = useFirestore()
  const { user } = useUser()
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Récupération du seuil pour le badge de statut
  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return doc(firestore, "users", user.uid, "settings", "current")
  }, [firestore, user])
  const { data: settings } = useDoc(settingsRef)
  const threshold = settings?.temperatureThreshold || 30

  // Récupération de TOUTES les mesures triées
  const measurementsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return query(
      collection(firestore, "users", user.uid, "temperatureMeasurements"),
      orderBy("timestamp", sortOrder)
    )
  }, [firestore, user, sortOrder])

  const { data: measurements, isLoading } = useCollection(measurementsQuery)

  const toggleSort = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc")
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
           <Database className="w-6 h-6 text-primary" />
           <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Data Warehouse</h1>
        </div>
        <p className="text-muted-foreground">Full historical logs retrieved from your private cloud database.</p>
      </header>

      <Card className="border-none shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Sensor Logs</CardTitle>
            <p className="text-xs text-muted-foreground">{measurements?.length || 0} records found</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleSort}
            className="gap-2"
          >
            {sortOrder === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            {sortOrder === "desc" ? "Most Recent" : "Oldest First"}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : measurements && measurements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurements.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {new Date(item.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-bold text-lg">
                      {item.value.toFixed(1)}°C
                    </TableCell>
                    <TableCell>
                      {item.value > threshold ? (
                        <Badge className="bg-accent text-white">Critical</Badge>
                      ) : (
                        <Badge variant="secondary">Optimal</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-20 text-muted-foreground italic">
              Aucune donnée enregistrée dans la base de données pour le moment.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
