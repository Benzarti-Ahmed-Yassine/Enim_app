
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { generateDailyMockData, TemperatureReading, getThreshold } from "@/lib/temp-data"
import { Calendar as CalendarIcon, ArrowDownWideNarrow } from "lucide-react"

export default function HistoryPage() {
  const [data, setData] = useState<TemperatureReading[]>([])
  const [threshold, setThreshold] = useState(30)

  useEffect(() => {
    // Reverse to show most recent first
    setData(generateDailyMockData().reverse())
    setThreshold(getThreshold())
  }, [])

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
          <Badge variant="outline" className="gap-2">
            <ArrowDownWideNarrow className="w-3 h-3" />
            Most Recent First
          </Badge>
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
