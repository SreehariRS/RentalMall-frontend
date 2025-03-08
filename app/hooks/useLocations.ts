import { useCallback } from "react";

interface Location {
  value: string;
  label: string;
  coordinates: [number, number];
  address: string;
  city?: string;
  country?: string;
}

const useLocations = () => {
  const searchLocations = useCallback(async (query: string): Promise<Location[]> => {
    const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic3JlZWhhcmlrYW5uYW4iLCJhIjoiY202NXl6YXZxMXR4eDJrc29pam1mb3dkMSJ9.vChdjB0Z5Yl7SDZbnjC5CQ';
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=place,address&limit=5`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      return data.features.map((feature: any) => ({
        value: feature.id,
        label: feature.place_name,
        coordinates: feature.center,
        address: feature.place_name,
        city: feature.context?.find((c: any) => c.id.startsWith('place'))?.text,
        country: feature.context?.find((c: any) => c.id.startsWith('country'))?.text
      }));
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }, []);

  return { searchLocations };
};

export default useLocations;
