import { FlatList, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { API_BASE } from '../../constants/config';

export function ImageCarousel({ images }: { images: { imageUrl: string }[] }) {
  const { width } = useWindowDimensions();
  const w = Math.min(width - 32, 640);
  return (
    <FlatList
      horizontal pagingEnabled data={images}
      keyExtractor={(i) => i.imageUrl}
      renderItem={({ item }) => (
        <Image source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : API_BASE + item.imageUrl }}
          style={[s.img, { width: w }]} resizeMode="cover" />
      )}
      showsHorizontalScrollIndicator={false}
    />
  );
}
const s = StyleSheet.create({ img: { height: 220, borderRadius: 12 } });
