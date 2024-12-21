import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

type Recommendation = {
  title: string;
  artist: string;
  genre: string[];
};

const fetchRecommendations = async (userId: string): Promise<Recommendation[]> => {
  try {
    const response = await axios.post('http://10.35.216.11:8000/recommend', { user_id: userId });
    return response.data.recommendations;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
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
        <View style={styles.itemContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.artist}>{item.artist}</Text>
          <Text style={styles.genre}>Genre: {item.genre?.join(', ')}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  artist: {
    fontSize: 14,
    color: '#dddddd',
    marginTop: 4,
  },
  genre: {
    fontSize: 14,
    color: '#aaaaaa',
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
