
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

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
          // Reverse geocoding to get address
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTQ5eDB4aXMwM3FzMmtzZW85NXN0ZXdvIn0.7wjXkVmIjmZkiCpKHWlJTg'}&country=IN&limit=1`
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          let address = '';
          let city = '';
          let state = '';
          let zipCode = '';
          
          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            address = feature.place_name || '';
            
            // Extract city, state, and zipCode from context
            feature.context?.forEach((item: any) => {
              if (item.id.includes('place')) {
                city = item.text;
              } else if (item.id.includes('region')) {
                state = item.text;
              } else if (item.id.includes('postcode')) {
                zipCode = item.text;
              }
            });
          }
          
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
            state: 'Unknown',
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
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTQ5eDB4aXMwM3FzMmtzZW85NXN0ZXdvIn0.7wjXkVmIjmZkiCpKHWlJTg'}&country=IN&limit=10&types=place,locality,neighborhood,address,poi`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features) {
      return [];
    }
    
    return data.features.map((feature: any) => {
      let city = '';
      let state = '';
      let zipCode = '';
      
      // Extract location details from context
      feature.context?.forEach((item: any) => {
        if (item.id.includes('place')) {
          city = item.text;
        } else if (item.id.includes('region')) {
          state = item.text;
        } else if (item.id.includes('postcode')) {
          zipCode = item.text;
        }
      });
      
      // If no city found in context, try to extract from place_name
      if (!city && feature.place_name) {
        const parts = feature.place_name.split(',');
        if (parts.length > 1) {
          city = parts[parts.length - 2]?.trim() || '';
        }
      }
      
      return {
        latitude: feature.center[1],
        longitude: feature.center[0],
        address: feature.place_name || feature.text || '',
        city: city || 'Unknown',
        state: state || 'India',
        zipCode: zipCode || ''
      };
    }).filter((location: Location) => 
      // Filter out invalid locations
      location.address && location.address.length > 0
    );
  } catch (error) {
    console.error('Location search error:', error);
    throw new Error('Failed to search locations. Please check your internet connection.');
  }
};
