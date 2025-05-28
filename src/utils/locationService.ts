
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
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTQ5eDB4aXMwM3FzMmtzZW85NXN0ZXdvIn0.7wjXkVmIjmZkiCpKHWlJTg'}&country=IN`
          );
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
          resolve({
            latitude,
            longitude
          });
        }
      },
      (error) => {
        reject(new Error(`Location error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000
      }
    );
  });
};

export const searchLocation = async (query: string): Promise<Location[]> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTQ5eDB4aXMwM3FzMmtzZW85NXN0ZXdvIn0.7wjXkVmIjmZkiCpKHWlJTg'}&country=IN&limit=5`
    );
    const data = await response.json();
    
    return data.features?.map((feature: any) => {
      let city = '';
      let state = '';
      let zipCode = '';
      
      feature.context?.forEach((item: any) => {
        if (item.id.includes('place')) {
          city = item.text;
        } else if (item.id.includes('region')) {
          state = item.text;
        } else if (item.id.includes('postcode')) {
          zipCode = item.text;
        }
      });
      
      return {
        latitude: feature.center[1],
        longitude: feature.center[0],
        address: feature.place_name,
        city,
        state,
        zipCode
      };
    }) || [];
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
};
