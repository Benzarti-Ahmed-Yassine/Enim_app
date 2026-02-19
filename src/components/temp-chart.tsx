
"use client"

import { useMemo, useState, useEffect } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useFirestore, useUser, useCollection, useDoc, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit, doc } from "firebase/firestore"
import { Loader2 } from "lucide-react"

export function TempChart() {
  const firestore = useFirestore()
  const { user } = useUser()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return doc(firestore, "users", user.uid, "settings", "current")
  }, [firestore, user])
  const { data: settings } = useDoc(settingsRef)
  const threshold = settings?.temperatureThreshold || 30

  const measurementsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return query(
      collection(firestore, "users", user.uid, "temperatureMeasurements"),
      orderBy("timestamp", "desc"),
      limit(10)
    )
  }, [firestore, user])

  const { data: rawData, isLoading } = useCollection(measurementsQuery)

  const chartData = useMemo(() => {
    if (!rawData) return []
    return [...rawData].reverse()
  }, [rawData])

  if (!isMounted || isLoading) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center border-none shadow-lg">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    )
  }

  return (
    <Card className="w-full border-none shadow-lg bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg font-headline">Real-time Trends (Last 10)</CardTitle>
        <CardDescription>Live data stored in Firestore</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full pr-4">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            En attente de données du capteur...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="timestamp" 
                axisLine={false}
                tickLine={false}
                tickFormatter={(str) => new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                style={{ fontSize: '10px' }}
              />
              <YAxis 
                domain={['dataMin - 2', 'dataMax + 2']} 
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '10px' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temperature']}
              />
              <ReferenceLine 
                y={threshold} 
                stroke="hsl(var(--accent))" 
                strokeDasharray="3 3" 
                label={{ value: 'Limit', position: 'right', fill: 'hsl(var(--accent))', fontSize: 10 }} 
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3} 
                dot={{ r: 4, fill: "hsl(var(--primary))" }}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
