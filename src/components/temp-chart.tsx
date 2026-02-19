
"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { generateDailyMockData, TemperatureReading, getThreshold } from "@/lib/temp-data"

export function TempChart() {
  const [data, setData] = useState<TemperatureReading[]>([])
  const [threshold, setThreshold] = useState(30)

  useEffect(() => {
    setData(generateDailyMockData())
    setThreshold(getThreshold())
  }, [])

  return (
    <Card className="w-full border-none shadow-lg bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg font-headline">Daily Trends</CardTitle>
        <CardDescription>Fluctuations over the last 24 hours</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="timestamp" 
              axisLine={false}
              tickLine={false}
              tickFormatter={(str) => new Date(str).toLocaleTimeString([], { hour: '2-digit' })}
              style={{ fontSize: '10px' }}
              minTickGap={30}
            />
            <YAxis 
              domain={['dataMin - 2', 'dataMax + 2']} 
              axisLine={false}
              tickLine={false}
              style={{ fontSize: '10px' }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              labelFormatter={(label) => new Date(label).toLocaleTimeString()}
              formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temperature']}
            />
            <ReferenceLine y={threshold} stroke="hsl(var(--accent))" strokeDasharray="3 3" label={{ value: 'Limit', position: 'right', fill: 'hsl(var(--accent))', fontSize: 10 }} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3} 
              dot={false}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
