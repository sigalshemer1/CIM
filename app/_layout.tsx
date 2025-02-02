import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { StyleSheet,View ,Image,Text } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { IconSymbol } from '@/components/ui/IconSymbol';
import 'react-native-reanimated';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import OpenAI from 'openai';

// import AppContext from './AppContext';
import HomeScreen from './Home';


import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  

  const Tab = createBottomTabNavigator();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    // <AppContext>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SQLiteProvider databaseName="acim.db" onInit={migrateDbIfNeeded}>
          <Tab.Navigator 
            screenOptions={{
              tabBarStyle: styles.tabBar,
              tabBarActiveTintColor: '#bf4da2',
              tabBarInactiveTintColor: '#6F5D6A',
              headerStyle: styles.header,
              headerTintColor: '#6F5D6A',
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerShown: true,
                tabBarIcon: ({ color, size }) => (
                  <Icon name="home-outline" color={color} size={size} />
                ),
              }}
            />
            {/* <Tab.Screen
              name="askme"
              component={GeneratorScreen}
              options={{
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <Icon name="sync-circle-outline" color={color} size={size} />
                ),
              }}
            /> */}
          </Tab.Navigator>
          <StatusBar style="auto" />
        </SQLiteProvider>
      </ThemeProvider>
    // </AppContext>
  );
}
async function migrateDbIfNeeded(db: SQLiteDatabase) {
//   const DATABASE_VERSION = 1;

//   let { user_version: currentDbVersion } = await db.getFirstAsync<{ user_version: number }>(
//     'PRAGMA user_version'
//   );

//   if (currentDbVersion >= DATABASE_VERSION) {
//     return; 
//   }

//   if (currentDbVersion === 0) {
//     await db.execAsync(`
//       PRAGMA journal_mode = 'wal';
//       CREATE TABLE IF NOT EXISTS acim_embeddings (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         chunk_text TEXT,
//         embedding TEXT
//       );
//     `);

//     // Check if table already contains data to prevent duplicate inserts
//     let { count } = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM acim_embeddings');
    
//     if (count === 0) {
//       console.log('Database is empty. Inserting initial data...');
//       await insertEmbeddingsData(db);  // Insert and embed the data into the new table
//     } else {
//       console.log('Database already contains embeddings. Skipping insert.');
//     }

//     // Set database version after migration
//     await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
//   }
}





const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#F3EFF0',
    borderTopWidth: 0,
  },
  header: {
    backgroundColor: '#0B2660',
    elevation: 0,
  },
  top:{
    backgroundColor: '#0B2660',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 22,
  },
});
