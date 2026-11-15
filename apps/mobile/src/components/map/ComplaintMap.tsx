import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { BANGALORE } from '../../constants/config';
import { colors } from '../../constants/colors';
import { Button } from '../ui/Button';

export function ComplaintMap({ complaints, onSelect }: { complaints: any[]; onSelect: (c: any) => void }) {
  return (
    <MapView style={StyleSheet.absoluteFill} initialRegion={BANGALORE}>
      {complaints.map((c) => (
        <Marker key={c.id} coordinate={{ latitude: c.latitude, longitude: c.longitude }}
          pinColor={(colors.status as any)[c.status] ?? '#9E9E9E'}>
          <Callout>
            <View style={{ maxWidth: 220 }}>
              <Text style={{ fontWeight: '700' }}>{c.title}</Text>
              <Text numberOfLines={2}>{c.description}</Text>
              <Button title="View Details" onPress={() => onSelect(c)} />
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}
