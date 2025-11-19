import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ExportOpportunity } from '@/types/market-development';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface OpportunitiesMapProps {
  opportunities: ExportOpportunity[];
  onOpportunityClick?: (opportunity: ExportOpportunity) => void;
}

export const OpportunitiesMap = ({ opportunities, onOpportunityClick }: OpportunitiesMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Group opportunities by country and city
  const groupedOpportunities = opportunities.reduce((acc, opp) => {
    const key = `${opp.destination_country}-${opp.destination_city || 'general'}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(opp);
    return acc;
  }, {} as Record<string, ExportOpportunity[]>);

  // Simplified geocoding - in production, use a proper geocoding service
  const getCoordinates = (country: string, city?: string | null): [number, number] => {
    // Basic coordinates for some countries (this should be replaced with proper geocoding)
    const countryCoords: Record<string, [number, number]> = {
      'France': [2.3522, 48.8566],
      'Allemagne': [13.4050, 52.5200],
      'Italie': [12.4964, 41.9028],
      'Espagne': [-3.7038, 40.4168],
      'Royaume-Uni': [-0.1276, 51.5074],
      'Belgique': [4.3517, 50.8503],
      'Pays-Bas': [4.9041, 52.3676],
      'Suisse': [7.4474, 46.9480],
      'Portugal': [-9.1393, 38.7223],
      'Maroc': [-6.8498, 33.9716],
      'Tunisie': [10.1815, 36.8065],
      'Sénégal': [-17.4467, 14.6928],
      'Côte d\'Ivoire': [-4.0305, 5.3600],
      'Cameroun': [11.5174, 3.8480],
      'Afrique du Sud': [28.0473, -26.2041],
      'Nigeria': [7.4914, 9.0820],
      'Kenya': [36.8219, -1.2921],
      'Chine': [116.4074, 39.9042],
      'Japon': [139.6503, 35.6762],
      'Inde': [77.2090, 28.6139],
      'Corée du Sud': [126.9780, 37.5665],
      'États-Unis': [-77.0369, 38.9072],
      'Canada': [-75.6972, 45.4215],
      'Brésil': [-47.8825, -15.7942],
      'Argentine': [-58.3816, -34.6037],
      'Chili': [-70.6693, -33.4489],
      'Mexique': [-99.1332, 19.4326],
    };

    return countryCoords[country] || [0, 0];
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken || isMapInitialized) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        projection: 'globe',
        zoom: 1.5,
        center: [20, 20],
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      map.current.on('style.load', () => {
        map.current?.setFog({
          color: 'rgb(255, 255, 255)',
          'high-color': 'rgb(200, 200, 225)',
          'horizon-blend': 0.2,
        });
      });

      setIsMapInitialized(true);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  useEffect(() => {
    if (!map.current || !isMapInitialized || opportunities.length === 0) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each location
    Object.entries(groupedOpportunities).forEach(([key, opps]) => {
      const [country, city] = key.split('-');
      const coords = getCoordinates(country, city !== 'general' ? city : null);
      
      if (coords[0] === 0 && coords[1] === 0) return; // Skip unknown locations

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'opportunity-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = 'hsl(var(--primary))';
      el.style.border = '3px solid hsl(var(--background))';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = 'hsl(var(--primary-foreground))';
      el.style.fontWeight = 'bold';
      el.style.fontSize = '12px';
      el.innerHTML = opps.length.toString();

      // Create popup content
      const popupContent = `
        <div class="p-2 max-w-xs">
          <h3 class="font-semibold mb-2">${country}${city !== 'general' ? ` - ${city}` : ''}</h3>
          <p class="text-sm text-muted-foreground mb-2">${opps.length} opportunité(s)</p>
          <div class="space-y-1 max-h-48 overflow-y-auto">
            ${opps.map(opp => `
              <div class="text-sm p-2 hover:bg-muted rounded cursor-pointer border border-border" 
                   onclick="window.dispatchEvent(new CustomEvent('opportunity-click', { detail: '${opp.id}' }))">
                <div class="font-medium">${opp.title}</div>
                <div class="text-xs text-muted-foreground">${opp.sector}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '300px'
      }).setHTML(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });

    // Listen for opportunity clicks from popup
    const handleOpportunityClick = (event: any) => {
      const opportunityId = event.detail;
      const opportunity = opportunities.find(o => o.id === opportunityId);
      if (opportunity && onOpportunityClick) {
        onOpportunityClick(opportunity);
      }
    };

    window.addEventListener('opportunity-click', handleOpportunityClick);

    return () => {
      window.removeEventListener('opportunity-click', handleOpportunityClick);
    };
  }, [opportunities, isMapInitialized, groupedOpportunities, onOpportunityClick]);

  useEffect(() => {
    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, []);

  if (!isMapInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Configuration de la carte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Token Mapbox Public</Label>
            <Input
              id="mapbox-token"
              type="text"
              placeholder="Entrez votre token Mapbox public..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Obtenez votre token gratuit sur{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>
          <Button onClick={initializeMap} disabled={!mapboxToken}>
            Initialiser la carte
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary"></div>
          <span className="text-sm font-medium">{opportunities.length} opportunités</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Cliquez sur un marqueur pour plus de détails
        </p>
      </div>
    </div>
  );
};
