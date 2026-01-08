import { MapPin } from 'lucide-react';
import worldGlobeImage from '@/assets/world-globe.png';

// Positions des marqueurs représentant les destinations d'export
const exportMarkers = [
  { id: 1, x: 48, y: 25, label: 'Europe' },
  { id: 2, x: 55, y: 35, label: 'Moyen-Orient' },
  { id: 3, x: 75, y: 40, label: 'Asie' },
  { id: 4, x: 22, y: 35, label: 'Amérique du Nord' },
  { id: 5, x: 28, y: 60, label: 'Amérique du Sud' },
  { id: 6, x: 48, y: 50, label: 'Afrique' },
  { id: 7, x: 80, y: 65, label: 'Océanie' },
  { id: 8, x: 65, y: 45, label: 'Inde' },
  { id: 9, x: 52, y: 30, label: 'Turquie' },
  { id: 10, x: 70, y: 35, label: 'Chine' },
  { id: 11, x: 78, y: 45, label: 'Japon' },
  { id: 12, x: 42, y: 28, label: 'Royaume-Uni' },
  { id: 13, x: 45, y: 32, label: 'France' },
  { id: 14, x: 50, y: 28, label: 'Allemagne' },
  { id: 15, x: 35, y: 55, label: 'Brésil' },
  { id: 16, x: 58, y: 42, label: 'Émirats' },
  { id: 17, x: 45, y: 45, label: 'Maroc' },
  { id: 18, x: 50, y: 55, label: 'Afrique du Sud' },
  { id: 19, x: 68, y: 50, label: 'Thaïlande' },
  { id: 20, x: 15, y: 40, label: 'États-Unis Ouest' },
];

export const WorldGlobeBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Image du globe du monde */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={worldGlobeImage}
          alt="Globe du monde"
          className="w-[140%] max-w-none h-auto opacity-25 object-contain translate-y-[5%]"
          style={{
            filter: 'hue-rotate(-10deg) saturate(1.2)',
          }}
        />
      </div>

      {/* Marqueurs de localisation animés */}
      <div className="absolute inset-0">
        {exportMarkers.map((marker, index) => (
          <div
            key={marker.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${marker.x}%`,
              top: `${marker.y}%`,
            }}
          >
            <div className="relative group flex flex-col items-center">
              {/* Effet de pulse autour du marqueur */}
              <div 
                className="absolute inset-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
                style={{ animationDuration: '2.5s', animationDelay: `${index * 0.4}s`, backgroundColor: 'rgba(0, 92, 49, 0.4)' }}
              />
              {/* Cercle de fond */}
              <div 
                className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse"
                style={{ animationDelay: `${index * 0.3}s`, backgroundColor: 'rgba(0, 92, 49, 0.6)' }}
              />
              <div className="relative">
                <MapPin 
                  className="w-5 h-5 drop-shadow-lg" 
                  fill="#005C31"
                  stroke="#005C31"
                  strokeWidth={1.5}
                />
              </div>
              {/* Label du pays */}
              <span 
                className="mt-0.5 text-[9px] font-semibold text-[#005C31] whitespace-nowrap drop-shadow-sm bg-white/70 px-1 rounded"
                style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
              >
                {marker.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lignes de connexion animées depuis l'Afrique (Côte d'Ivoire) */}
      <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(32, 94%, 54%)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(152, 100%, 28%)" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="lineGradient2" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(32, 94%, 54%)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(152, 100%, 28%)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        
        {/* Ligne vers l'Europe */}
        <path
          d="M 48% 50% Q 48% 38%, 48% 25%"
          fill="none"
          stroke="url(#lineGradient1)"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="animate-dash"
        />
        
        {/* Ligne vers l'Amérique du Nord */}
        <path
          d="M 48% 50% Q 35% 42%, 22% 35%"
          fill="none"
          stroke="url(#lineGradient2)"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="animate-dash"
        />
        
        {/* Ligne vers l'Asie */}
        <path
          d="M 48% 50% Q 62% 45%, 75% 40%"
          fill="none"
          stroke="url(#lineGradient1)"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="animate-dash"
        />
        
        {/* Ligne vers le Moyen-Orient */}
        <path
          d="M 48% 50% Q 52% 42%, 55% 35%"
          fill="none"
          stroke="url(#lineGradient1)"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="animate-dash"
        />
      </svg>

      {/* Overlay gradient pour la lisibilité du formulaire */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
    </div>
  );
};

export default WorldGlobeBackground;
