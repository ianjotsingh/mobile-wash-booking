
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTQ5eDB4aXMwM3FzMmtzZW85NXN0ZXdvIn0.7wjXkVmIjmZkiCpKHWlJTg';

export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use Nominatim (OpenStreetMap) as a backup free service
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&countrycodes=in&addressdetails=1`
          );
          
          if (!response.ok) {
            throw new Error('Failed to get address details');
          }
          
          const data = await response.json();
          
          const address = data.display_name || '';
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          const state = data.address?.state || '';
          const zipCode = data.address?.postcode || '';
          
          resolve({
            latitude,
            longitude,
            address,
            city,
            state,
            zipCode
          });
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          // Return coordinates even if reverse geocoding fails
          resolve({
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            city: 'Unknown',
            state: 'India',
            zipCode: ''
          });
        }
      },
      (error) => {
        let errorMessage = 'Location access denied or unavailable.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location access in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  });
};

export const searchLocation = async (query: string): Promise<Location[]> => {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    // Use Nominatim for search as well
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=10&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data.map((item: any) => {
      const city = item.address?.city || item.address?.town || item.address?.village || '';
      const state = item.address?.state || 'India';
      const zipCode = item.address?.postcode || '';
      
      return {
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        address: item.display_name || '',
        city: city || 'Unknown',
        state: state,
        zipCode: zipCode || ''
      };
    }).filter((location: Location) => 
      location.address && location.address.length > 0
    );
  } catch (error) {
    console.error('Location search error:', error);
    throw new Error('Failed to search locations. Please check your internet connection.');
  }
};
