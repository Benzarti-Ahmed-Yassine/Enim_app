
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.log("L'utilisateur doit interagir avec la page en premier."));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm overflow-hidden group">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isPlaying ? 'bg-primary/20 animate-pulse' : 'bg-slate-100'}`}>
            <Music className={`w-4 h-4 ${isPlaying ? 'text-primary' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ambiance Étude</p>
            <p className="text-xs font-semibold text-slate-700">Engineering Focus</p>
          </div>
        </div>
        
        <Button 
          variant={isPlaying ? "default" : "outline"} 
          size="icon" 
          onClick={toggleMusic}
          className="rounded-full w-10 h-10 shrink-0"
        >
          {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </Button>

        <audio 
          ref={audioRef} 
          loop 
          src="https://cdn.pixabay.com/audio/2022/02/10/audio_1e37083049.mp3" 
        />
      </CardContent>
    </Card>
  );
}
