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
          // Use Nominatim (OpenStreetMap) for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&countrycodes=in&addressdetails=1&zoom=16&extratags=1`
          );
          
          if (!response.ok) {
            throw new Error('Failed to get address details');
          }
          
          const data = await response.json();
          
          // Better address formatting for Indian addresses
          const address = formatIndianAddress(data);
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || '';
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
          // Return a more user-friendly fallback with generic location name
          resolve({
            latitude,
            longitude,
            address: 'Current Location',
            city: 'Detected Location',
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
        maximumAge: 600000 // 10 minutes cache for better performance
      }
    );
  });
};

// Helper function to format Indian addresses better
const formatIndianAddress = (data: any): string => {
  const parts = [];
  
  // Build a meaningful address from available components
  if (data.address?.house_number) parts.push(data.address.house_number);
  if (data.address?.road) parts.push(data.address.road);
  if (data.address?.neighbourhood) parts.push(data.address.neighbourhood);
  if (data.address?.suburb) parts.push(data.address.suburb);
  if (data.address?.city || data.address?.town || data.address?.village) {
    parts.push(data.address.city || data.address.town || data.address.village);
  }
  
  // If we have meaningful address parts, use them
  if (parts.length > 0) {
    return parts.join(', ');
  }
  
  // Fallback to a more user-friendly name extraction
  if (data.display_name) {
    const addressParts = data.display_name.split(', ');
    // Take the first few meaningful parts (usually area, city)
    return addressParts.slice(0, 3).join(', ');
  }
  
  // Last resort fallback
  return 'Current Location';
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
