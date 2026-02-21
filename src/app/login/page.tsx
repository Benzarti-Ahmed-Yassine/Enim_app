
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const enimLogo = PlaceHolderImages.find(img => img.id === 'enim-logo');

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Connexion réussie", description: "Accès au tableau de bord en cours..." });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Échec de connexion", 
        description: "Identifiants incorrects ou compte inexistant." 
      });
      setIsLoading(false);
    }
  };

  if (user && !isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-white w-24 h-24 rounded-2xl flex items-center justify-center mb-2 shadow-lg border p-2">
            {enimLogo && (
              <div className="relative w-full h-full">
                <Image 
                  src={enimLogo.imageUrl} 
                  alt="ENIM Logo" 
                  fill 
                  className="object-contain"
                  data-ai-hint={enimLogo.imageHint}
                />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-primary tracking-tight">ENIM Monastir</CardTitle>
          <CardDescription className="flex items-center justify-center gap-2 text-amber-600 font-medium bg-amber-50 py-1 px-2 rounded-md border border-amber-100">
            <AlertCircle className="w-4 h-4" />
            Accès réservé au personnel autorisé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Identifiant Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="login-email" 
                  type="email" 
                  placeholder="nom.prenom@enim.tn" 
                  className="pl-10 h-11" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="login-password" 
                  type="password" 
                  className="pl-10 h-11" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
              Se Connecter
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 justify-center text-[11px] text-muted-foreground text-center border-t pt-4">
          <p className="font-semibold text-primary/60 italic">Aucune inscription publique autorisée.</p>
          <p>Les comptes sont créés exclusivement par l'Administrateur Système de l'ENIM.</p>
          <div className="mt-2 pt-2 border-t w-full flex justify-between px-4 opacity-40 font-mono">
            <span>SECURE ENIM GATEWAY</span>
            <span>V2.5.0</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
