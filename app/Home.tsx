import { Alert, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput } from 'react-native';
import { useState } from 'react';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: "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",  // Replace with your OpenAI API Key
});

export default function HomeScreen() {
  const [newQuestion, setNewQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle the search
  const handleSearch = async () => {
    if (!newQuestion.trim()) return;
  
    setIsLoading(true);
    try {
      // Step 1: Send the raw question to the backend for embedding
      const response = await fetch('http://192.168.1.67/generate_embedding/', { // New endpoint to generate embedding
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: newQuestion,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.embedding) {
        // Step 2: Send the generated embedding to the search endpoint
        const searchResponse = await fetch('http://192.168.1.67/search/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            embedding: data.embedding,  // Use the generated embedding
            top_k: 3,
          }),
        });
  
        const searchData = await searchResponse.json();
  
        if (searchResponse.ok) {
          // Step 3: Display the search results
          setResponse(
            searchData.results.map((result: any, index: number) => (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.resultText}>
                  <Text style={styles.resultRank}>Rank: {result.rank}</Text>
                  {" | "} 
                  <Text style={styles.resultText}>Page: {result.page_number}</Text>
                  {" | "} 
                  <Text style={styles.resultText}>Distance: {result.distance.toFixed(4)}</Text>
                  {"\n"}
                  {result.chunk_text}
                </Text>
              </View>
            ))
          );
        } else {
          Alert.alert('Error', 'Something went wrong with the search request');
        }
      } else {
        Alert.alert('Error', 'Failed to generate embedding');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to perform search');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.bodyContainer}>
          <Text style={styles.mainTitle}>Welcome</Text>
          <TextInput
              style={styles.inputWrap}
              onChangeText={setNewQuestion}
              placeholder="Ask a question"
              multiline
            />

          <TouchableOpacity
              style={styles.customButton}
              onPress={handleSearch}
          >
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>

          {isLoading ? (
            <Text style={styles.loadingText}>Searching...</Text>
          ) : (
            <View>{response}</View>
          )}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bodyContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0B2660',
  },
  safeAreaView: {
    flex: 1,
    backgroundColor: '#F3EFF0',
  },
  scrollView: {
    flexGrow: 1,
  },
  mainTitle: {
    color: '#FFE08A',
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputWrap:{
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 7,
    backgroundColor:'#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginTop:6,
    paddingHorizontal:10,
    height:70,
  },
  customButton: {
    backgroundColor: '#bf4da2',
    paddingVertical: 12,
    marginBottom:10,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width:'100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  resultItem: {
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
  },
  resultRank: {
    fontWeight: 'bold',
  },
  resultText: {
    color: '#333',
  },
});
