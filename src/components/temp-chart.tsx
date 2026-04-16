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
      limit(15)
    )
  }, [firestore, user])

  const { data: rawData, isLoading } = useCollection(measurementsQuery)

  const chartData = useMemo(() => {
    if (!rawData) return []
    return [...rawData].reverse().map(d => ({
      ...d,
      displayVal: d.value ?? d.temperature ?? 0
    }))
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
        <CardTitle className="text-lg font-headline">Historique des Capteurs (ENIM)</CardTitle>
        <CardDescription>Données temps réel provenant du matériel</CardDescription>
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
                tickFormatter={(str) => {
                  try { return new Date(str).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
                  catch(e) { return "" }
                }}
                style={{ fontSize: '10px' }}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '10px' }}
              />
              <Tooltip 
                labelFormatter={(label) => new Date(label).toLocaleString('fr-FR')}
                formatter={(value: number) => [`${Number(value).toFixed(1)}°C`, 'Température']}
              />
              <ReferenceLine 
                y={threshold} 
                stroke="hsl(var(--accent))" 
                strokeDasharray="3 3" 
                label={{ value: 'Limite', position: 'right', fill: 'hsl(var(--accent))', fontSize: 10 }} 
              />
              <Line 
                type="monotone" 
                dataKey="displayVal" 
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