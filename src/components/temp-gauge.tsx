'use client';

import { useEffect, useState, useRef } from "react"
import { Thermometer, Loader2, AlertTriangle, Cpu, Mail, WifiOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, collection, query, orderBy, limit } from "firebase/firestore"
import { sendAlertEmail } from "@/ai/flows/send-alert-email"

export function TempGauge() {
  const firestore = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return doc(firestore, "users", user.uid, "settings", "current")
  }, [firestore, user])

  const { data: settings } = useDoc(settingsRef)
  
  const latestQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return query(
      collection(firestore, "users", user.uid, "temperatureMeasurements"),
      orderBy("timestamp", "desc"),
      limit(1)
    )
  }, [firestore, user])

  const { data: latestData, isLoading: isDataLoading } = useCollection(latestQuery)
  
  const [isSendingAlert, setIsSendingAlert] = useState(false)
  const lastAlertTime = useRef<number>(0)
  const lastInactivityAlertTime = useRef<number>(0)
  
  const threshold = settings?.temperatureThreshold || 30
  const latestMeasurement = latestData?.[0]
  const currentTemp = latestMeasurement?.value ?? latestMeasurement?.temperature ?? null
  const lastTimestamp = latestMeasurement?.timestamp ? new Date(latestMeasurement.timestamp).getTime() : null
  
  const isHigh = currentTemp !== null && currentTemp > threshold
  const [isInactive, setIsInactive] = useState(false)

  // Vérification de l'inactivité toutes les minutes
  useEffect(() => {
    const checkInactivity = () => {
      if (!lastTimestamp) return
      const now = Date.now()
      const diffMinutes = (now - lastTimestamp) / 60000
      
      if (diffMinutes > 10) {
        setIsInactive(true)
        // Envoi d'alerte d'inactivité (toutes les 30 minutes si ça persiste)
        if (now - lastInactivityAlertTime.current > 1800000 && settings?.emailAlerts !== false && settings?.alertEmail) {
          sendAlertEmail({
            recipientEmail: settings.alertEmail,
            alertType: 'inactivity',
            lastSeen: latestMeasurement?.timestamp
          })
          lastInactivityAlertTime.current = now
          toast({
            variant: "destructive",
            title: "📡 PERTE DE SIGNAL",
            description: "L'ESP32 ne répond plus depuis 10 min. Alerte envoyée.",
          })
        }
      } else {
        setIsInactive(false)
      }
    }

    const timer = setInterval(checkInactivity, 30000)
    checkInactivity()
    return () => clearInterval(timer)
  }, [lastTimestamp, settings, latestMeasurement, toast])

  // Alerte de température élevée
  useEffect(() => {
    if (currentTemp === null || !user || isInactive) return

    if (currentTemp > threshold) {
      const now = Date.now()
      // Évite le spam : 1 alerte toutes les 5 minutes
      if (now - lastAlertTime.current > 300000) {
        toast({
          variant: "destructive",
          title: "🚨 SEUIL CRITIQUE DÉPASSÉ",
          description: `Température actuelle : ${currentTemp.toFixed(1)}°C. Envoi des alertes...`,
        })
        
        if (settings?.emailAlerts !== false && settings?.alertEmail) {
          setIsSendingAlert(true)
          sendAlertEmail({
            recipientEmail: settings.alertEmail,
            temperature: currentTemp,
            threshold: threshold,
            alertType: 'temperature'
          }).finally(() => setIsSendingAlert(false))
        }
        lastAlertTime.current = now
      }
    }
  }, [currentTemp, threshold, settings, user, toast, isInactive])

  if (isDataLoading) return (
    <div className="h-64 flex flex-col items-center justify-center gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className={`w-64 h-64 rounded-full border-8 flex flex-col items-center justify-center relative bg-card transition-all duration-1000 ${
        isInactive ? 'border-slate-300 opacity-60' : 
        isHigh ? 'border-accent shadow-[0_0_50px_rgba(255,119,41,0.3)] scale-105 bg-accent/5' : 
        'border-primary shadow-sm'
      }`}>
        {isInactive ? <WifiOff className="w-10 h-10 text-slate-400 mb-2" /> : <Thermometer className={`w-8 h-8 mb-2 ${isHigh ? 'text-accent' : 'text-primary'}`} />}
        
        {currentTemp !== null && !isInactive ? (
          <>
            <span className={`text-6xl font-bold tracking-tighter ${isHigh ? 'text-accent' : 'text-primary'}`}>
              {Number(currentTemp).toFixed(1)}°
            </span>
            <span className="text-sm font-medium text-muted-foreground">Celsius</span>
          </>
        ) : (
          <div className="text-center px-4">
            <Cpu className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-[11px] text-muted-foreground font-bold uppercase">{isInactive ? 'ESP32 Déconnecté' : 'Lien Inactif'}</p>
          </div>
        )}
        
        {isHigh && !isInactive && (
          <div className="absolute -bottom-4 bg-accent text-white px-4 py-1.5 rounded-full text-xs font-bold animate-bounce flex items-center gap-2 shadow-lg border-2 border-white">
            <AlertTriangle className="w-3.5 h-3.5" />
            ÉTAT CRITIQUE
          </div>
        )}

        {isInactive && (
          <div className="absolute -bottom-4 bg-slate-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-2 shadow-lg border-2 border-white">
            <WifiOff className="w-3 h-3" />
            HORS-LIGNE > 10 MIN
          </div>
        )}

        {isSendingAlert && (
          <div className="absolute top-2 right-2 p-2 bg-primary text-white rounded-full shadow-md animate-pulse">
            <Mail className="w-4 h-4" />
          </div>
        )}
      </div>
      
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
           <div className={`w-2.5 h-2.5 rounded-full ${(!isInactive && currentTemp !== null) ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
             {isInactive ? 'Perte de signal ESP32' : currentTemp !== null ? 'Flux Matériel Actif' : 'En attente du capteur'}
           </p>
        </div>
        {!isInactive && <p className="text-sm font-medium text-slate-600">Seuil Configuré : <span className="text-accent font-bold">{threshold.toFixed(1)}°C</span></p>}
        {isInactive && lastTimestamp && (
          <p className="text-[10px] text-muted-foreground">
            Dernier signal : {new Date(lastTimestamp).toLocaleTimeString('fr-FR')}
          </p>
        )}
      </div>
    </div>
  )
}