import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TrackPlayer, { Track } from 'react-native-track-player';

type Recommendation = {
  title: string;
  artist: string;
  url: string; // Şarkının çalınması için gerekli olan URL
};

const fetchRecommendations = async (userId: string): Promise<Recommendation[]> => {
  try {
    const response = await axios.post('https://fastapi-recommendation-system.onrender.com/recommend_songs', {
      user_id: userId,
    });
    return response.data.recommendations;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

const playTrack = async (track: Track) => {
  try {
    await TrackPlayer.reset();
    await TrackPlayer.add(track);
    await TrackPlayer.play();
  } catch (error) {
    console.error('Error playing track:', error);
  }
};

const MusicSuggestion = () => {
  const { session } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRecommendations = async () => {
      if (session?.user) {
        setLoading(true);
        const data = await fetchRecommendations(session.user.id);
        setRecommendations(data);
        setLoading(false);
      }
    };

    getRecommendations();
  }, [session]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Fetching your recommendations...</Text>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No recommendations available at the moment.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={recommendations}
      keyExtractor={(item, index) => `${item.title}-${index}`}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() =>
            playTrack({
              id: `${item.title}-${item.artist}`,
              url: item.url, // Şarkının URL'si (backend'den doğru şekilde gelmeli)
              title: item.title,
              artist: item.artist,
            })
          }
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.artist}>{item.artist}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: 'black',
  },
  itemContainer: {
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    backgroundColor: '#333',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  artist: {
    fontSize: 14,
    color: '#dddddd',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  emptyText: {
    fontSize: 16,
    color: 'white',
  },
});

export default MusicSuggestion;
