// components/RouteMap.tsx
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useState } from 'react'

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// Auto-resize to prevent grey/blank tiles
function MapResizer() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => { map.invalidateSize() }, 100)
  }, [map])
  return null
}

function RecenterButton({ userLat, userLng }: any) {
  const map = useMap()
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        map.setView([userLat, userLng], 18, { animate: true })
      }}
      style={{ zIndex: 999 }}
      className="absolute bottom-6 right-6 bg-white text-gray-900 px-4 py-3 rounded-full shadow-2xl border border-gray-200 font-bold hover:bg-gray-50 transition flex items-center gap-2"
    >
      <span>📍 Recenter</span>
    </button>
  )
}

export default function RouteMap({ userLat, userLng, destLat, destLng, destinationName }: any) {
  const [routePath, setRoutePath] = useState<any[]>([])

  useEffect(() => {
    setRoutePath([[userLat, userLng], [destLat, destLng]])

    async function fetchRoute() {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/foot/${userLng},${userLat};${destLng},${destLat}?overview=full&geometries=geojson`
        )
        const data = await response.json()
        if (data.routes && data.routes[0]) {
          const coordinates = data.routes[0].geometry.coordinates.map((coord: any) => [coord[1], coord[0]])
          setRoutePath(coordinates)
        }
      } catch (e) {
        console.error("Routing failed", e)
      }
    }
    fetchRoute()
  }, [userLat, userLng, destLat, destLng])

  return (
    <div className="absolute inset-0 w-full h-full z-0 bg-gray-50">
      <MapContainer 
        center={[userLat, userLng]} 
        zoom={18} 
        style={{ height: "100%", width: "100%" }} 
        zoomControl={false}
      >
        <MapResizer />

        {/* 🎨 CLEAN MODERN MAP (CartoDB Voyager) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <Marker position={[userLat, userLng]} icon={icon}><Popup>You are here</Popup></Marker>
        <Marker position={[destLat, destLng]} icon={icon}><Popup>{destinationName}</Popup></Marker>
        
        <Polyline positions={routePath} pathOptions={{ color: '#3b82f6', weight: 6, opacity: 0.9 }} />
        <Polyline positions={[[userLat, userLng], [destLat, destLng]]} pathOptions={{ color: 'grey', dashArray: '5, 10', weight: 2, opacity: 0.5 }} />
        
        <RecenterButton userLat={userLat} userLng={userLng} />
      </MapContainer>
    </div>
  )
}