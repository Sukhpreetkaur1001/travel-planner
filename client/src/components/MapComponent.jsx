import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
})

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
})

function FitBounds({ bounds }) {
  const map = useMap()
  const fitted = useRef(false)
  useEffect(() => {
    if (!fitted.current && bounds) {
      map.fitBounds(bounds, { padding: [60, 60] })
      fitted.current = true
    }
  }, [bounds, map])
  return null
}

const MapComponent = ({ lat, lon, originLat, originLon, destination, originCity }) => {
  const [route, setRoute] = useState(null)

  const destLat = parseFloat(lat)
  const destLon = parseFloat(lon)
  const origLat = originLat ? parseFloat(originLat) : null
  const origLon = originLon ? parseFloat(originLon) : null

  const dest = [destLat, destLon]
  const origin = origLat && origLon ? [origLat, origLon] : null

  useEffect(() => {
    if (!origin) return
    setRoute(null)
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${origLon},${origLat};${destLon},${destLat}?overview=full&geometries=geojson`
    )
      .then(res => res.json())
      .then(data => {
        if (data.code === 'Ok' && data.routes?.[0]) {
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]])
          setRoute(coords)
        } else {
          setRoute([origin, dest])
        }
      })
      .catch(() => setRoute([origin, dest]))
  }, [origLat, origLon, destLat, destLon])

  if (!lat || !lon) return null

  const bounds = origin ? [origin, dest] : null
  const center = origin
    ? [(destLat + origLat) / 2, (destLon + origLon) / 2]
    : dest


  return (
    <div>
      {originCity && (
        <div style={{ marginBottom: '10px', fontSize: '13px', color: '#666' }}>
          📍 <strong>{originCity}</strong> → <strong>{destination}</strong>
        </div>
      )}
      <MapContainer
        center={center}
        zoom={origin ? 5 : 12}
        style={{ height: '420px', width: '100%', borderRadius: '12px' }}
        key={`${lat}-${lon}-${originLat}-${originLon}`}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={dest} icon={redIcon}>
          <Popup><strong>📍 {destination}</strong></Popup>
        </Marker>
        {origin && (
          <>
            <Marker position={origin} icon={greenIcon}>
              <Popup><strong>🏠 {originCity}</strong></Popup>
            </Marker>
            {route && <Polyline positions={route} color="#4A90E2" weight={4} opacity={0.85} />}
            {bounds && <FitBounds bounds={bounds} />}
          </>
        )}
      </MapContainer>
    </div>
  )
}

export default MapComponent
