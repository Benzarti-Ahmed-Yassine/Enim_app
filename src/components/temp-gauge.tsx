
"use client"

import { useEffect, useState } from "react"
import { Thermometer, AlertTriangle } from "lucide-react"
import { getThreshold } from "@/lib/temp-data"
import { useToast } from "@/hooks/use-toast"

export function TempGauge() {
  const [temp, setTemp] = useState<number | null>(null)
  const [threshold, setThresholdState] = useState(30)
  const { toast } = useToast()

  useEffect(() => {
    setThresholdState(getThreshold())
    
    // Initial random value
    const initialTemp = 24.5 + Math.random() * 5
    setTemp(initialTemp)

    const interval = setInterval(() => {
      setTemp(prev => {
        if (prev === null) return 25
        const change = (Math.random() - 0.5) * 0.5
        const next = prev + change
        
        // Check threshold
        if (next > threshold && prev <= threshold) {
          toast({
            variant: "destructive",
            title: "Temperature Threshold Exceeded!",
            description: `The current temperature is ${next.toFixed(1)}°C, which is above your limit of ${threshold}°C. An alert email has been sent.`,
          })
        }
        
        return next
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [threshold, toast])

  if (temp === null) return <div className="h-64 flex items-center justify-center">Loading sensor...</div>

  const isHigh = temp > threshold

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="relative group">
        <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-1000 ${isHigh ? 'bg-accent' : 'bg-primary'}`} />
        <div className={`w-64 h-64 rounded-full border-8 flex flex-col items-center justify-center relative bg-card transition-colors duration-500 ${isHigh ? 'border-accent shadow-[0_0_20px_rgba(255,119,41,0.3)]' : 'border-primary shadow-[0_0_20px_rgba(41,98,255,0.2)]'}`}>
          <div className="absolute top-10 flex items-center gap-1 text-muted-foreground">
            <Thermometer className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-tighter">Current</span>
          </div>
          <span className={`text-6xl font-bold font-headline tracking-tight transition-colors duration-500 ${isHigh ? 'text-accent' : 'text-primary'}`}>
            {temp.toFixed(1)}°
          </span>
          <span className="text-xl font-medium text-muted-foreground mt-2">Celsius</span>
          
          {isHigh && (
            <div className="absolute -bottom-4 bg-accent text-white px-4 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              ALERT ACTIVE
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Threshold: {threshold}°C</p>
        <p className="text-xs text-muted-foreground">Last updated: Just now</p>
      </div>
    </div>
  )
}
