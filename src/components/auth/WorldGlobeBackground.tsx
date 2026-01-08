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
];

export const WorldGlobeBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Fond uni vert - même couleur partout */}
      <div 
        className="absolute inset-0" 
        style={{ backgroundColor: 'hsl(152, 22%, 65%)' }} 
      />

      {/* Image du globe du monde avec couleur verte de la plateforme */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[140%] h-auto translate-y-[5%] translate-x-[15%]">
          {/* Image en niveaux de gris */}
          <img
            src={worldGlobeImage}
            alt="Globe du monde"
            className="w-full h-auto object-contain"
            style={{
              filter: 'grayscale(100%) brightness(0.7)',
              opacity: 0.35,
            }}
          />
          {/* Overlay vert avec blend mode */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundColor: 'hsl(152, 30%, 55%)',
              mixBlendMode: 'multiply',
              opacity: 1,
            }}
          />
        </div>
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
            <div className="relative group">
              {/* Effet de pulse autour du marqueur */}
              <div 
                className="absolute inset-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/40 animate-ping"
                style={{ animationDuration: '2.5s', animationDelay: `${index * 0.4}s` }}
              />
              {/* Cercle de fond */}
              <div 
                className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/60 animate-pulse"
                style={{ animationDelay: `${index * 0.3}s` }}
              />
              <div className="relative">
                <MapPin 
                  className="w-6 h-6 text-secondary drop-shadow-lg" 
                  fill="hsl(32, 94%, 54%)"
                  strokeWidth={1.5}
                />
              </div>
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

    </div>
  );
};

export default WorldGlobeBackground;
