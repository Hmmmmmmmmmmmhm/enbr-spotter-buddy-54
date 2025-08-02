// Flight data service for AeroDataBox API
const API_KEY = 'df5f0e8d52mshd02dcf026de9c03p1302c3jsn5ca6a913233e';
const API_BASE_URL = 'https://aerodatabox.p.rapidapi.com';

// ICAO code for Bergen Airport
const BERGEN_AIRPORT_ICAO = 'ENBR';

// Aircraft types to exclude (common everyday planes)
const EXCLUDED_AIRCRAFT_TYPES = [
  'DH8A', 'DH8B', 'DH8C', 'DH8D', // All Dash 8 variants
  'B738', 'B38M', 'B737-800', 'B737 MAX 8', // 737-800 and MAX
  'BCS1', 'BCS3', 'A220-100', 'A220-300', // A220s
  'A320', 'A319', 'A321', 'A20N', 'A21N' // A320 family (but not A319 if needed)
];

// Include these despite being in 737 family
const INCLUDED_AIRCRAFT_TYPES = [
  'B737', 'B737-700' // 737-700s are wanted
];

// Known special livery registrations (expandable database)
const SPECIAL_LIVERY_REGISTRATIONS = [
  'LN-DYA', 'LN-DYB', 'LN-DYC', // SAS special liveries
  'SE-REX', 'SE-RXA', // Braathens regional special
  'EI-FHA', 'EI-FHB', // Ryanair special liveries
  'G-EUUU', 'G-EUUR', // BA special liveries
  // Add more as discovered
];

// Military aircraft registration patterns and known callsigns
const MILITARY_PATTERNS = [
  /^0[1-9]/, // Norwegian military pattern
  /^C-/, // Some military prefixes
  /^GAF/, // German Air Force
  /^RAF/, // Royal Air Force
];

export interface FlightData {
  registration: string;
  aircraftType: string;
  airline: string;
  arrivalTime: string;
  isSpecialLivery: boolean;
  isMilitary: boolean;
  origin?: string;
  callSign?: string;
}

export class FlightService {
  private async fetchWithHeaders(url: string): Promise<Response> {
    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response;
  }

  private isSpecialLivery(registration: string): boolean {
    return SPECIAL_LIVERY_REGISTRATIONS.includes(registration.toUpperCase());
  }

  private isMilitaryAircraft(registration: string, callSign?: string): boolean {
    const regUpper = registration.toUpperCase();
    
    // Check registration patterns
    if (MILITARY_PATTERNS.some(pattern => pattern.test(regUpper))) {
      return true;
    }

    // Check callsign patterns
    if (callSign) {
      const callUpper = callSign.toUpperCase();
      return callUpper.includes('FORCE') || 
             callUpper.includes('MILITARY') || 
             callUpper.includes('NAVY') ||
             callUpper.includes('ARMY');
    }

    return false;
  }

  private shouldIncludeAircraft(aircraftType: string): boolean {
    // First check if it's explicitly included
    if (INCLUDED_AIRCRAFT_TYPES.some(type => aircraftType.includes(type))) {
      return true;
    }
    
    // Then check if it should be excluded
    if (EXCLUDED_AIRCRAFT_TYPES.some(type => aircraftType.includes(type))) {
      return false;
    }
    
    // Include everything else (unusual aircraft)
    return true;
  }

  async getSpecialArrivals(): Promise<FlightData[]> {
    try {
      // Get current time and 12 hours from now (API limit)
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 12 * 60 * 60 * 1000);
      
      const fromTime = now.toISOString().split('.')[0];
      const toTime = tomorrow.toISOString().split('.')[0];
      
      // Fetch arrivals for next 12 hours
      const url = `${API_BASE_URL}/flights/airports/icao/${BERGEN_AIRPORT_ICAO}/${fromTime}/${toTime}`;
      
      const response = await this.fetchWithHeaders(url);
      const data = await response.json();
      
      const arrivals = data.arrivals || [];
      
      const specialFlights: FlightData[] = [];
      
      for (const flight of arrivals) {
        const aircraft = flight.aircraft;
        if (!aircraft || !aircraft.reg || !aircraft.model) continue;
        
        const aircraftType = aircraft.model;
        const registration = aircraft.reg;
        
        // Apply filtering logic
        if (!this.shouldIncludeAircraft(aircraftType)) continue;
        
        const isSpecial = this.isSpecialLivery(registration);
        const isMilitary = this.isMilitaryAircraft(registration, flight.callSign);
        
        // Always include military aircraft and special liveries
        // Also include aircraft that passed the type filter
        if (isSpecial || isMilitary || this.shouldIncludeAircraft(aircraftType)) {
          const arrivalTime = flight.arrival?.scheduledTime?.local || 
                            flight.arrival?.actualTime?.local || 
                            flight.arrival?.scheduledTime?.utc || 
                            flight.arrival?.actualTime?.utc || 
                            'Unknown';
          
          console.log('Flight arrival data:', {
            callSign: flight.callSign,
            arrival: flight.arrival,
            arrivalTime
          });
          
          specialFlights.push({
            registration,
            aircraftType,
            airline: flight.airline?.name || 'Unknown',
            arrivalTime,
            isSpecialLivery: isSpecial,
            isMilitary: isMilitary,
            origin: flight.departure?.airport?.name,
            callSign: flight.callSign
          });
        }
      }
      
      // Sort by arrival time
      return specialFlights.sort((a, b) => 
        new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime()
      );
      
    } catch (error) {
      console.error('Error fetching flight data:', error);
      throw error;
    }
  }
}