import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { StyleSheet} from 'react-native';

import Home from './Home';
import Sudoku from './Sudoku';
import Success from './Success';

const Stack = createNativeStackNavigator();

export default function App() {
  const textColor = '#DADADA'
  const styles = StyleSheet.create({
    // #121212
    headerStyle: {
      backgroundColor: '#191919',
    },
    headerTitle: {
      color: textColor,
    },
  });

  return (
    <NavigationContainer>
      <Stack.Navigator  screenOptions={{headerTintColor: textColor, headerStyle: styles.headerStyle, headerTitleStyle: styles.headerTitle}} >
        <Stack.Screen name='Home' component={Home} />
        <Stack.Screen name='Sudoku' component={Sudoku}/>
        <Stack.Screen name='Success' component={Success}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}

