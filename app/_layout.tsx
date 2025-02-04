import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { StyleSheet,View ,Image,Text } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { createStackNavigator } from '@react-navigation/stack';
import logo from '../assets/images/logo.png';

export const HeaderLogo = () => <Image source={logo} style={styles.logo} />;

// import AppContext from './AppContext';
import HomeScreen from './Home';


import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const Stack = createStackNavigator();
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
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#1d336d',
      card: '#1d336d', // Header background
    },
  };

  const customDefaultTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#1d336d',
      card: '#1d336d', // Header background
    },
  };

  return (
      <ThemeProvider value={colorScheme === 'dark' ?  customDarkTheme : customDefaultTheme}>
          <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: true,
              headerTitle: () => <HeaderLogo />,
            }}
          />
        </Stack.Navigator>
          <StatusBar style="auto" />
      </ThemeProvider>
  );
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
  logo: {
    width: 335,
    height: 100,
    resizeMode: 'contain',
    alignItems: 'center',
    marginTop:45,
  }
});
