'use client';

import { useEffect, useState, useRef } from "react"
import { Thermometer, Loader2, AlertTriangle, Send, Cpu } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, collection, query, orderBy, limit } from "firebase/firestore"
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates"
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
  
  // Requête pour écouter la toute dernière valeur enregistrée dans Firestore (Arduino ou Web)
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
  
  const threshold = settings?.temperatureThreshold || 30
  
  // Valeur actuelle : on prend celle de Firestore, sinon simulation si aucune donnée
  const currentTemp = latestData?.[0]?.value ?? null
  const isHigh = currentTemp !== null && currentTemp > threshold

  // Effet pour l'alerte automatique (E-mail)
  useEffect(() => {
    if (currentTemp === null || !user) return

    if (currentTemp > threshold) {
      const now = Date.now()
      // Anti-spam de 2 minutes
      if (now - lastAlertTime.current > 120000) {
        toast({
          variant: "destructive",
          title: "🚨 Dépassement de seuil !",
          description: `Température critique détectée : ${currentTemp.toFixed(1)}°C.`,
        })
        
        if (settings?.emailAlerts !== false && settings?.alertEmail) {
          setIsSendingAlert(true)
          const recipients = settings.alertEmail.split(',').map(e => e.trim()).filter(e => e !== "")
          
          Promise.all(recipients.map(recipient => 
            sendAlertEmail({
              recipientEmail: recipient,
              temperature: currentTemp,
              threshold: threshold,
              unit: "Celsius"
            })
          )).then(() => {
            toast({
              title: "Alertes e-mail envoyées",
              description: `Notification transmise à ${recipients.length} destinataire(s).`,
            })
          }).catch(err => {
            console.error("Erreur d'envoi d'e-mail:", err)
          }).finally(() => {
            setIsSendingAlert(false)
          })
        }
        
        lastAlertTime.current = now
      }
    }
  }, [currentTemp, threshold, settings, user, toast])

  if (isDataLoading) return (
    <div className="h-64 flex flex-col items-center justify-center gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-xs text-muted-foreground animate-pulse">Liaison base de données...</p>
    </div>
  )

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className={`w-64 h-64 rounded-full border-8 flex flex-col items-center justify-center relative bg-card transition-all duration-700 ${isHigh ? 'border-accent shadow-[0_0_50px_rgba(255,119,41,0.3)] scale-105 bg-accent/5' : 'border-primary shadow-sm'}`}>
        <Thermometer className={`w-8 h-8 mb-2 ${isHigh ? 'text-accent' : 'text-primary'}`} />
        
        {currentTemp !== null ? (
          <>
            <span className={`text-6xl font-bold tracking-tighter ${isHigh ? 'text-accent' : 'text-primary'}`}>
              {currentTemp.toFixed(1)}°
            </span>
            <span className="text-sm font-medium text-muted-foreground">Celsius</span>
          </>
        ) : (
          <div className="text-center px-4">
            <Cpu className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground italic">En attente de données du capteur Arduino...</p>
          </div>
        )}
        
        {isHigh && (
          <div className="absolute -bottom-4 bg-accent text-white px-4 py-1.5 rounded-full text-xs font-bold animate-bounce flex items-center gap-2 shadow-lg">
            <AlertTriangle className="w-3.5 h-3.5" />
            ÉTAT CRITIQUE
          </div>
        )}
        
        {isSendingAlert && (
          <div className="absolute top-4 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2 shadow-md">
            <Send className="w-3 h-3 animate-pulse" />
            ENVOI ALERTE IA...
          </div>
        )}
      </div>
      
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
           <div className={`w-2 h-2 rounded-full ${currentTemp !== null ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
           <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
             {currentTemp !== null ? 'Hardware Live Link' : 'Capteur Déconnecté'}
           </p>
        </div>
        <p className="text-sm font-medium">Seuil de sécurité : <span className="text-accent font-bold">{threshold.toFixed(1)}°C</span></p>
      </div>
    </div>
  )
}
