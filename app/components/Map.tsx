"use client";
import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
});

interface MapProps {
    center?: number[]; // expecting [lng, lat]
}

function Map({ center }: MapProps) {
    // Convert coordinates if they exist (Mapbox returns [lng, lat], Leaflet needs [lat, lng])
    const mapCenter: L.LatLngExpression = center ? [center[1], center[0]] : [51, -0.09]; // Default to [51, -0.09] if no center

    return (
        <MapContainer
            center={mapCenter}
            zoom={center ? 4 : 2}
            scrollWheelZoom={false}
            className="h-[35vh] rounded-lg"
        >
            <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {center && (
                <Marker position={[center[1], center[0]] as L.LatLngExpression} />
            )}
        </MapContainer>
    );
}

export default Map;