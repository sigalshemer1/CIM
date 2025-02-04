import { Alert, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput,Image } from 'react-native';
import { useState } from 'react';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: "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",
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
      const embeddingResponse = await fetch('http://192.168.1.67:8000/generate_embedding/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion }),
      });

      const embeddingData = await embeddingResponse.json();
  
      if (embeddingResponse.ok && embeddingData.embedding) {
        // Step 2: Send the generated embedding to the search endpoint
        const searchResponse = await fetch('http://192.168.1.67:8000/search/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embedding: embeddingData.embedding,
            top_k: 3,
          }),
        });
  
        const searchData = await searchResponse.json();
  
        if (searchResponse.ok) {
          // Step 3: Combine the search results text into a single string
          const resultsText = searchData.results.map((result) => result.chunk_text).join("\n\n");

          // Step 4: Call the summarize endpoint with the results text
          const summarizeResponse = await fetch('http://192.168.1.67:8000/summarize/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: resultsText }),
          });

          const summaryData = await summarizeResponse.json();
          console.log('Summarize Response:', summaryData);
          
          if (summarizeResponse.ok) {
            // Step 5: Display the summarized response
            setResponse(summaryData.summary);
          } else {
            Alert.alert('Error', `Failed to summarize the search results: ${summaryData.error || 'Unknown error'}`);
          }
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

  const handleReset = () => {
    setNewQuestion('');
    setResponse('');
  };
  

  

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.bodyContainer}>
          <TextInput
              style={styles.inputWrap}
              onChangeText={setNewQuestion}
              placeholder="Ask a question"
              multiline
              value={newQuestion}
            />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
                style={styles.customButton}
                onPress={handleSearch}
            >
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>


            <TouchableOpacity
              style={styles.customButton}
              onPress={handleReset}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <Text style={styles.loadingText}>Searching...</Text>
          ) : (
            <View><Text style={styles.responseText}>{response}</Text></View>
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
    backgroundColor: '#1d336d',
  },
  safeAreaView: {
    flex: 1,
    backgroundColor: '#1d336d',
  },
  scrollView: {
    flexGrow: 1,
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
    marginTop:10,
    paddingHorizontal:10,
    height:130,
    textAlignVertical: 'top',
    marginBottom:10,
  },
  buttonContainer: {
    flexDirection: 'row',  // Aligns buttons horizontally
    justifyContent: 'space-between', // Adds space between them
    alignItems: 'center',  // Ensures vertical alignment
    marginTop: 10,  // Adjust spacing as needed
  },
  customButton: {
    flex: 1,  // Makes both buttons take equal width
    marginHorizontal: 5,  // Adds spacing between buttons
    padding: 10,
    backgroundColor: '#fff',  // Example color
    borderRadius: 5,
    alignItems: 'center',
  },
  
  buttonText: {
    color: '#1d336d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  responseText: {
    color: '#fff', // or any color you prefer
    fontSize: 16,
    marginTop: 10,
    lineHeight: 22,
  }
});
