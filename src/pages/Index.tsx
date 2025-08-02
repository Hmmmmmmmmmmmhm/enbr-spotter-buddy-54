import { useState, useEffect } from "react";
import { AircraftCard } from "@/components/AircraftCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { FlightService, FlightData } from "@/components/FlightService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plane, RefreshCw, MapPin, Clock } from "lucide-react";

const Index = () => {
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const flightService = new FlightService();

  const fetchFlights = async () => {
    try {
      setError(null);
      const specialFlights = await flightService.getSpecialArrivals();
      setFlights(specialFlights);
      setLastUpdated(new Date());
      
      if (specialFlights.length === 0) {
        toast({
          title: "No special aircraft found",
          description: "No rare or special aircraft arriving in the next 24 hours.",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch flight data';
      setError(errorMessage);
      toast({
        title: "Error fetching flights",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchFlights();
  };

  useEffect(() => {
    fetchFlights();
    
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchFlights, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const specialLiveryCount = flights.filter(f => f.isSpecialLivery).length;
  const militaryCount = flights.filter(f => f.isMilitary).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-aviation-sky/5 to-primary/5">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Plane className="h-8 w-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-radar-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-sky bg-clip-text text-transparent">
                  ENBR Spotter Buddy
                </h1>
                <p className="text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Bergen Airport • Next 24 Hours
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="text-sm text-muted-foreground hidden sm:block">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Updated {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              <Button 
                onClick={handleRefresh} 
                disabled={loading}
                size="sm"
                className="bg-gradient-sky"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Plane className="h-3 w-3" />
              {flights.length} Special Aircraft
            </Badge>
            {specialLiveryCount > 0 && (
              <Badge className="bg-aviation-special text-white">
                {specialLiveryCount} Special Liveries
              </Badge>
            )}
            {militaryCount > 0 && (
              <Badge className="bg-aviation-military text-white">
                {militaryCount} Military
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-destructive text-lg font-semibold mb-2">
              Unable to fetch flight data
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              Try Again
            </Button>
          </div>
        ) : flights.length === 0 ? (
          <div className="text-center py-12">
            <Plane className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No special aircraft found</h2>
            <p className="text-muted-foreground">
              No rare or special aircraft are scheduled to arrive at Bergen Airport in the next 24 hours.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flights.map((flight, index) => (
              <AircraftCard key={`${flight.registration}-${index}`} aircraft={flight} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-card/30 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Data provided by AeroDataBox API • Updates every 10 minutes
          </p>
          <p className="mt-1">
            Excludes common aircraft (Dash 8s, 737-800/MAX, A220s, A320s) but includes 737-700s
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
