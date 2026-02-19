
import { TempGauge } from "@/components/temp-gauge"
import { TempChart } from "@/components/temp-chart"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, ShieldCheck, Zap } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Status Overview</h1>
        <p className="text-muted-foreground">Live precision data from your connected sensors.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Card className="h-full border-none shadow-lg overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4">
               <Activity className="w-5 h-5 text-primary opacity-20" />
             </div>
             <CardContent className="pt-6">
               <TempGauge />
             </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-4">
          <TempChart />
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-md bg-white">
              <CardContent className="pt-4 flex flex-col gap-2">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">System Status</p>
                  <p className="text-sm font-bold">Encrypted & Online</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-white">
              <CardContent className="pt-4 flex flex-col gap-2">
                <Zap className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Network Latency</p>
                  <p className="text-sm font-bold">12ms Response</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
