import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, MapPin, Star } from "lucide-react";

interface AircraftCardProps {
  aircraft: {
    registration: string;
    aircraftType: string;
    airline: string;
    arrivalTime: string;
    isSpecialLivery: boolean;
    isMilitary: boolean;
    origin?: string;
  };
}

export const AircraftCard = ({ aircraft }: AircraftCardProps) => {
  const formatTime = (timeString: string) => {
    if (!timeString || timeString === 'Unknown') {
      return 'Unknown';
    }
    
    try {
      const date = new Date(timeString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return timeString;
      }
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch {
      return timeString;
    }
  };

  return (
    <Card className={`p-4 transition-all duration-300 animate-aircraft-arrive ${
      aircraft.isSpecialLivery ? 'shadow-special border-aviation-special/30' : 'shadow-aircraft'
    } hover:shadow-lg hover:scale-[1.02]`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg text-foreground">
            {aircraft.registration}
          </span>
        </div>
        
        <div className="flex gap-1">
          {aircraft.isSpecialLivery && (
            <Badge className="bg-aviation-special text-white">
              <Star className="h-3 w-3 mr-1" />
              Special Livery
            </Badge>
          )}
          {aircraft.isMilitary && (
            <Badge className="bg-aviation-military text-white">
              Military
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="font-semibold text-foreground">{aircraft.aircraftType}</span>
          <span>•</span>
          <span>{aircraft.airline}</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-accent" />
            <span className="font-medium text-accent">
              {formatTime(aircraft.arrivalTime)}
            </span>
          </div>
          
          {aircraft.origin && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{aircraft.origin}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};