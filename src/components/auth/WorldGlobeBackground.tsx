import { MapPin } from 'lucide-react';

// Positions des marqueurs représentant les destinations d'export
const exportMarkers = [
  { id: 1, x: 48, y: 28, label: 'Europe' },
  { id: 2, x: 52, y: 35, label: 'Moyen-Orient' },
  { id: 3, x: 72, y: 42, label: 'Asie' },
  { id: 4, x: 25, y: 38, label: 'Amérique' },
  { id: 5, x: 48, y: 55, label: 'Afrique' },
  { id: 6, x: 78, y: 65, label: 'Océanie' },
  { id: 7, x: 58, y: 48, label: 'Inde' },
  { id: 8, x: 30, y: 55, label: 'Brésil' },
];

export const WorldGlobeBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Globe SVG stylisé avec projection courbée */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.15]">
        <svg
          viewBox="0 0 100 60"
          className="w-[180%] h-auto max-w-none translate-y-[10%]"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Définitions des gradients */}
          <defs>
            <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(152, 100%, 22%)" />
              <stop offset="50%" stopColor="hsl(187, 100%, 35%)" />
              <stop offset="100%" stopColor="hsl(152, 100%, 28%)" />
            </linearGradient>
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(187, 100%, 42%)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="hsl(187, 100%, 35%)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Lignes de latitude courbées */}
          <path
            d="M 5 30 Q 50 10, 95 30"
            fill="none"
            stroke="hsl(152, 100%, 22%)"
            strokeWidth="0.15"
            strokeOpacity="0.3"
          />
          <path
            d="M 8 40 Q 50 25, 92 40"
            fill="none"
            stroke="hsl(152, 100%, 22%)"
            strokeWidth="0.15"
            strokeOpacity="0.3"
          />
          <path
            d="M 10 50 Q 50 38, 90 50"
            fill="none"
            stroke="hsl(152, 100%, 22%)"
            strokeWidth="0.15"
            strokeOpacity="0.3"
          />

          {/* Amérique du Nord */}
          <path
            d="M 15 22 
               Q 18 18, 25 17 
               Q 30 16, 32 20 
               Q 34 24, 30 28 
               Q 26 32, 22 30 
               Q 18 28, 15 22 Z"
            fill="url(#globeGradient)"
            className="drop-shadow-sm"
          />

          {/* Amérique du Sud */}
          <path
            d="M 25 38 
               Q 28 35, 32 38 
               Q 35 42, 33 50 
               Q 31 56, 27 58 
               Q 24 56, 23 50 
               Q 22 44, 25 38 Z"
            fill="url(#globeGradient)"
            className="drop-shadow-sm"
          />

          {/* Europe */}
          <path
            d="M 45 18 
               Q 50 15, 55 17 
               Q 58 19, 56 24 
               Q 54 28, 50 27 
               Q 46 26, 45 22 
               Q 44 20, 45 18 Z"
            fill="url(#globeGradient)"
            className="drop-shadow-sm"
          />

          {/* Afrique */}
          <path
            d="M 46 30 
               Q 52 28, 56 32 
               Q 60 38, 58 48 
               Q 56 56, 50 58 
               Q 44 56, 44 48 
               Q 44 40, 46 30 Z"
            fill="url(#globeGradient)"
            className="drop-shadow-sm"
          />

          {/* Asie */}
          <path
            d="M 58 16 
               Q 68 14, 78 18 
               Q 85 22, 82 30 
               Q 80 38, 72 42 
               Q 64 44, 60 38 
               Q 56 32, 58 24 
               Q 58 20, 58 16 Z"
            fill="url(#globeGradient)"
            className="drop-shadow-sm"
          />

          {/* Inde */}
          <path
            d="M 62 38 
               Q 66 36, 68 40 
               Q 70 46, 66 50 
               Q 62 52, 60 48 
               Q 58 44, 62 38 Z"
            fill="url(#globeGradient)"
            className="drop-shadow-sm"
          />

          {/* Océanie */}
          <path
            d="M 75 52 
               Q 82 50, 86 54 
               Q 88 58, 84 62 
               Q 78 64, 74 60 
               Q 72 56, 75 52 Z"
            fill="url(#globeGradient)"
            className="drop-shadow-sm"
          />

          {/* Indonésie */}
          <path
            d="M 72 48 
               Q 76 47, 80 49 
               Q 82 51, 78 52 
               Q 74 53, 72 50 
               Q 71 49, 72 48 Z"
            fill="url(#globeGradient)"
            className="drop-shadow-sm"
          />
        </svg>
      </div>

      {/* Marqueurs de localisation animés */}
      <div className="absolute inset-0">
        {exportMarkers.map((marker, index) => (
          <div
            key={marker.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={{
              left: `${marker.x}%`,
              top: `${marker.y}%`,
              animationDelay: `${index * 0.3}s`,
              animationDuration: '2s',
            }}
          >
            <div className="relative group">
              {/* Effet de pulse autour du marqueur */}
              <div 
                className="absolute inset-0 rounded-full bg-secondary/30 animate-ping"
                style={{ animationDuration: '3s', animationDelay: `${index * 0.5}s` }}
              />
              <div className="relative">
                <MapPin 
                  className="w-5 h-5 text-secondary drop-shadow-lg" 
                  fill="hsl(32, 94%, 54%)"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lignes de connexion depuis la Côte d'Ivoire */}
      <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(32, 94%, 54%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(152, 100%, 28%)" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {/* Lignes courbes de la Côte d'Ivoire vers les destinations */}
        <path
          d="M 48% 55% Q 40% 35%, 25% 38%"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="animate-dash"
        />
        <path
          d="M 48% 55% Q 48% 40%, 48% 28%"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="animate-dash"
        />
        <path
          d="M 48% 55% Q 60% 45%, 72% 42%"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="animate-dash"
        />
      </svg>

      {/* Overlay gradient pour la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
    </div>
  );
};

export default WorldGlobeBackground;
