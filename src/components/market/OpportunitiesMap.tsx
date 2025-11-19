import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExportOpportunity } from '@/types/market-development';
import { Button } from '@/components/ui/button';
import { Globe, MapPin } from 'lucide-react';

interface OpportunitiesMapProps {
  opportunities: ExportOpportunity[];
  onOpportunityClick?: (opportunity: ExportOpportunity) => void;
}

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const OpportunitiesMap = ({ opportunities, onOpportunityClick }: OpportunitiesMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  // Group opportunities by country and city
  const groupedOpportunities = opportunities.reduce((acc, opp) => {
    const key = `${opp.destination_country}-${opp.destination_city || 'general'}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(opp);
    return acc;
  }, {} as Record<string, ExportOpportunity[]>);

  // Get coordinates for countries (simplified geocoding)
  const getCoordinates = (country: string, city?: string | null): [number, number] => {
    const countryCoords: Record<string, [number, number]> = {
      'France': [48.8566, 2.3522],
      'Allemagne': [52.5200, 13.4050],
      'Italie': [41.9028, 12.4964],
      'Espagne': [40.4168, -3.7038],
      'Royaume-Uni': [51.5074, -0.1276],
      'Belgique': [50.8503, 4.3517],
      'Pays-Bas': [52.3676, 4.9041],
      'Suisse': [46.9480, 7.4474],
      'Portugal': [38.7223, -9.1393],
      'Maroc': [33.9716, -6.8498],
      'Tunisie': [36.8065, 10.1815],
      'Sénégal': [14.6928, -17.4467],
      'Côte d\'Ivoire': [5.3600, -4.0305],
      'Cameroun': [3.8480, 11.5174],
      'Afrique du Sud': [-26.2041, 28.0473],
      'Nigeria': [9.0820, 7.4914],
      'Kenya': [-1.2921, 36.8219],
      'Chine': [39.9042, 116.4074],
      'Japon': [35.6762, 139.6503],
      'Inde': [28.6139, 77.2090],
      'Corée du Sud': [37.5665, 126.9780],
      'États-Unis': [38.9072, -77.0369],
      'Canada': [45.4215, -75.6972],
      'Brésil': [-15.7942, -47.8825],
      'Argentine': [-34.6037, -58.3816],
      'Chili': [-33.4489, -70.6693],
      'Mexique': [19.4326, -99.1332],
      'Égypte': [30.0444, 31.2357],
      'Algérie': [36.7538, 3.0588],
      'Ghana': [5.6037, -0.1870],
      'Éthiopie': [9.0320, 38.7469],
      'Tanzanie': [-6.7924, 39.2083],
      'Ouganda': [0.3476, 32.5825],
      'Angola': [-8.8383, 13.2344],
      'Mozambique': [-25.9655, 32.5832],
      'Madagascar': [-18.8792, 47.5079],
      'Mali': [12.6392, -8.0029],
      'Niger': [13.5127, 2.1128],
      'Burkina Faso': [12.3714, -1.5197],
      'Tchad': [12.1348, 15.0557],
    };

    return countryCoords[country] || [0, 0];
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Create map
    const map = L.map(mapContainer.current, {
      worldCopyJump: true,
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([20, 0], 2);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Create markers layer
    markersLayer.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update markers when opportunities change
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current) return;

    // Clear existing markers
    markersLayer.current.clearLayers();

    // Add markers for each location
    Object.entries(groupedOpportunities).forEach(([key, opps]) => {
      const [country, city] = key.split('-');
      const coords = getCoordinates(country, city !== 'general' ? city : null);
      
      if (coords[0] === 0 && coords[1] === 0) return;

      // Create custom icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: hsl(var(--primary));
            border: 3px solid hsl(var(--background));
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: hsl(var(--primary-foreground));
            font-weight: bold;
            font-size: 12px;
          ">
            ${opps.length}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-4 min-w-[400px]';
      popupContent.innerHTML = `
        <div class="mb-3 pb-3 border-b border-border">
          <h3 class="text-lg font-bold text-foreground mb-1">${country}${city !== 'general' ? ` - ${city}` : ''}</h3>
          <p class="text-sm text-muted-foreground">${opps.length} opportunité${opps.length > 1 ? 's' : ''} disponible${opps.length > 1 ? 's' : ''}</p>
        </div>
      `;

      const oppList = document.createElement('div');
      oppList.className = 'space-y-2 max-h-96 overflow-y-auto pr-2';
      oppList.style.scrollbarWidth = 'thin';

      opps.forEach(opp => {
        const oppDiv = document.createElement('div');
        oppDiv.className = 'p-3 hover:bg-accent/50 rounded-lg cursor-pointer border border-border bg-card transition-all duration-200 hover:shadow-md';
        
        const statusColors = {
          'URGENT': 'bg-red-500 text-white',
          'NOUVEAU': 'bg-blue-500 text-white',
          'RECOMMANDÉ': 'bg-green-500 text-white',
          'EN_COURS': 'bg-yellow-500 text-white',
          'FERMÉ': 'bg-gray-500 text-white'
        };
        
        const statusColor = statusColors[opp.status as keyof typeof statusColors] || 'bg-gray-500 text-white';
        const deadlineDate = new Date(opp.deadline).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
        
        oppDiv.innerHTML = `
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="font-semibold text-foreground text-base flex-1">${opp.title}</div>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${statusColor}">
              ${opp.status?.replace('_', ' ')}
            </span>
          </div>
          <div class="space-y-1.5">
            <div class="flex items-center gap-2 text-sm">
              <span class="text-muted-foreground">📊 Secteur:</span>
              <span class="font-medium text-foreground">${opp.sector}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-muted-foreground">💰 Valeur estimée:</span>
              <span class="font-medium text-foreground">${opp.estimated_value.toLocaleString()} ${opp.currency || 'CFA'}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-muted-foreground">📅 Date limite:</span>
              <span class="font-medium text-foreground">${deadlineDate}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-muted-foreground">📦 Volume:</span>
              <span class="font-medium text-foreground">${opp.volume}</span>
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-border">
            <p class="text-xs text-muted-foreground line-clamp-2">${opp.description}</p>
          </div>
        `;
        
        oppDiv.onclick = () => {
          if (onOpportunityClick) {
            onOpportunityClick(opp);
          }
        };
        oppList.appendChild(oppDiv);
      });

      popupContent.appendChild(oppList);

      // Add marker with popup
      const marker = L.marker(coords, { icon: customIcon })
        .bindPopup(popupContent, {
          maxWidth: 450,
          minWidth: 400,
          closeButton: true,
          className: 'custom-leaflet-popup'
        });

      markersLayer.current!.addLayer(marker);
    });
  }, [opportunities, groupedOpportunities, onOpportunityClick]);

  const centerOnAfrica = () => {
    if (!mapInstance.current) return;
    const boundsAfrica = L.latLngBounds(
      L.latLng(-36, -20), // sud-ouest
      L.latLng(38, 55)    // nord-est
    );
    mapInstance.current.fitBounds(boundsAfrica, { padding: [20, 20] });
  };

  const centerOnWorld = () => {
    if (!mapInstance.current) return;
    mapInstance.current.setView([20, 0], 2);
  };

  return (
    <div className="space-y-4">
      <div 
        ref={mapContainer} 
        className="w-full h-[600px] rounded-lg overflow-hidden border border-border shadow-lg"
        role="region"
        aria-label="Carte des opportunités d'exportation"
      />
      
      <div className="flex gap-3 items-center flex-wrap">
        <Button onClick={centerOnAfrica} variant="outline" className="gap-2">
          <MapPin className="h-4 w-4" />
          Centrer sur l'Afrique
        </Button>
        <Button onClick={centerOnWorld} variant="outline" className="gap-2">
          <Globe className="h-4 w-4" />
          Vue globale
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
          <div className="w-4 h-4 rounded-full bg-primary"></div>
          <span className="font-medium">{opportunities.length} opportunités</span>
        </div>
      </div>
    </div>
  );
};
