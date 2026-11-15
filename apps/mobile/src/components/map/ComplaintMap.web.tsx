import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { colors } from '../../constants/colors';
import { BANGALORE } from '../../constants/config';

const icon = (color: string) => L.divIcon({
  html: `<div style="width:14px;height:14px;border-radius:7px;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
  className: '', iconSize: [14, 14], iconAnchor: [7, 7],
});

export function ComplaintMap({ complaints, onSelect }: { complaints: any[]; onSelect: (c: any) => void }) {
  return (
    <MapContainer center={[BANGALORE.latitude, BANGALORE.longitude]} zoom={11}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors' />
      {complaints.map((c) => (
        <Marker key={c.id} position={[c.latitude, c.longitude]}
          icon={icon((colors.status as any)[c.status] ?? '#9E9E9E')}>
          <Popup>
            <b>{c.title}</b><br />
            {c.description?.slice(0, 120)}<br />
            <button onClick={() => onSelect(c)} style={{ marginTop: 6, padding: '6px 12px', background: colors.primary, color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer' }}>
              View Details
            </button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
