import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExportOpportunity } from '@/types/market-development';
import { Button } from '@/components/ui/button';
import { Globe, MapPin } from 'lucide-react';
import { SendToOperatorsDialog } from './SendToOperatorsDialog';

interface OpportunitiesMapProps {
  opportunities: ExportOpportunity[];
  onOpportunityClick?: (opportunity: ExportOpportunity) => void;
  canManage?: boolean;
}

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const OpportunitiesMap = ({ opportunities, onOpportunityClick, canManage = false }: OpportunitiesMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ExportOpportunity | null>(null);

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

      // Determine marker color based on opportunity priority
      const hasUrgent = opps.some(o => o.status === 'URGENT');
      const hasRecommended = opps.some(o => o.status === 'RECOMMANDÉ');
      
      let markerColor = '#10b981'; // Vert par défaut
      let markerBorder = '#059669';
      
      if (hasUrgent) {
        markerColor = '#f97316'; // Orange pour urgent
        markerBorder = '#ea580c';
      } else if (hasRecommended) {
        markerColor = '#10b981'; // Vert pour recommandé
        markerBorder = '#059669';
      }

      // Create custom icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${markerColor} 0%, ${markerBorder} 100%);
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25), 0 0 0 2px ${markerColor}40;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            transition: transform 0.2s;
            animation: pulse 2s infinite;
          ">
            ${opps.length}
          </div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            .custom-marker:hover > div {
              transform: scale(1.15) !important;
              box-shadow: 0 6px 16px rgba(0,0,0,0.35), 0 0 0 3px ${markerColor}60;
            }
          </style>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-4 min-w-[400px] bg-white rounded-lg';
      popupContent.innerHTML = `
        <div class="mb-3 pb-3 border-b-2 border-green-500">
          <h3 class="text-lg font-bold text-gray-800 mb-1">📍 ${country}${city !== 'general' ? ` - ${city}` : ''}</h3>
          <p class="text-sm text-gray-600 font-medium">${opps.length} opportunité${opps.length > 1 ? 's' : ''} disponible${opps.length > 1 ? 's' : ''}</p>
        </div>
      `;

      const oppList = document.createElement('div');
      oppList.className = 'space-y-2 max-h-96 overflow-y-auto pr-2';
      oppList.style.scrollbarWidth = 'thin';

      opps.forEach(opp => {
        const oppDiv = document.createElement('div');
        oppDiv.className = 'p-3 hover:bg-green-50 rounded-lg cursor-pointer border-2 border-gray-200 bg-white transition-all duration-200 hover:shadow-lg hover:border-green-400';
        
        const statusColors = {
          'URGENT': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
          'NOUVEAU': 'bg-gradient-to-r from-white to-gray-100 text-gray-800 border border-gray-300',
          'RECOMMANDÉ': 'bg-gradient-to-r from-green-500 to-green-600 text-white',
          'EN_COURS': 'bg-gradient-to-r from-orange-400 to-orange-500 text-white',
          'FERMÉ': 'bg-gray-400 text-white'
        };
        
        const statusColor = statusColors[opp.status as keyof typeof statusColors] || 'bg-gray-400 text-white';
        const deadlineDate = new Date(opp.deadline).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
        
        oppDiv.innerHTML = `
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="font-bold text-gray-800 text-base flex-1">${opp.title}</div>
            <span class="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusColor} shadow-sm">
              ${opp.status?.replace('_', ' ')}
            </span>
          </div>
          <div class="space-y-1.5">
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-500 font-medium">📊 Secteur:</span>
              <span class="font-semibold text-green-700">${opp.sector}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-500 font-medium">💰 Valeur estimée:</span>
              <span class="font-bold text-orange-600">${opp.estimated_value.toLocaleString()} ${opp.currency || 'CFA'}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-500 font-medium">📅 Date limite:</span>
              <span class="font-semibold text-gray-700">${deadlineDate}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-500 font-medium">📦 Volume:</span>
              <span class="font-semibold text-gray-700">${opp.volume}</span>
            </div>
          </div>
          <div class="mt-2 pt-2 border-t-2 border-gray-200">
            <p class="text-xs text-gray-600 line-clamp-2">${opp.description}</p>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button 
              class="opp-details-btn"
              data-opp-id="${opp.id}"
              style="
                padding: 10px 16px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                flex: 1;
                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
                transition: all 0.2s;
              "
              onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.4)';"
              onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(16, 185, 129, 0.3)';"
            >
              📋 Voir détails
            </button>
            ${canManage ? `
            <button 
              class="opp-send-btn"
              data-opp-id="${opp.id}"
              style="
                padding: 10px 16px;
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                flex: 1;
                box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
                transition: all 0.2s;
              "
              onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(249, 115, 22, 0.4)';"
              onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(249, 115, 22, 0.3)';"
            >
              📤 Envoyer
            </button>
            ` : ''}
          </div>
        `;
        
        oppList.appendChild(oppDiv);
        
        // Add event listeners to buttons after appending
        setTimeout(() => {
          const detailsBtn = oppDiv.querySelector('.opp-details-btn');
          const sendBtn = oppDiv.querySelector('.opp-send-btn');
          
          if (detailsBtn) {
            detailsBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              if (onOpportunityClick) {
                onOpportunityClick(opp);
              }
            });
          }
          
          if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              setSelectedOpportunity(opp);
              setSendDialogOpen(true);
            });
          }
        }, 0);
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
    <>
      <style>
        {`
          .leaflet-popup {
            z-index: 50 !important;
          }
          .leaflet-pane {
            z-index: 1 !important;
          }
        `}
      </style>
      <div className="space-y-4">
        <div 
          ref={mapContainer} 
          className="w-full h-[600px] rounded-xl overflow-hidden border-2 border-green-200 shadow-2xl relative"
          role="region"
          aria-label="Carte des opportunités d'exportation"
        >
          {/* Légende des couleurs */}
          <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border-2 border-green-200">
            <div className="text-xs font-bold text-gray-700 mb-2">Légende</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-white shadow"></div>
                <span className="text-xs font-medium text-gray-700">Urgent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 border-2 border-white shadow"></div>
                <span className="text-xs font-medium text-gray-700">Recommandé</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 items-center flex-wrap">
          <Button 
            onClick={centerOnAfrica} 
            className="gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold shadow-lg border-2 border-white"
          >
            <MapPin className="h-4 w-4" />
            Centrer sur l'Afrique
          </Button>
          <Button 
            onClick={centerOnWorld} 
            className="gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold shadow-lg border-2 border-green-200"
          >
            <Globe className="h-4 w-4" />
            Vue globale
          </Button>
          <div className="flex items-center gap-2 text-sm ml-auto bg-gradient-to-r from-green-100 to-green-50 px-4 py-2 rounded-full border-2 border-green-200 shadow-md">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 animate-pulse"></div>
            <span className="font-bold text-green-700">{opportunities.length} opportunités actives</span>
          </div>
        </div>
      </div>

      {selectedOpportunity && (
        <SendToOperatorsDialog
          open={sendDialogOpen}
          onOpenChange={setSendDialogOpen}
          opportunityId={selectedOpportunity.id}
          opportunityTitle={selectedOpportunity.title}
          opportunitySector={selectedOpportunity.sector}
        />
      )}
    </>
  );
};
