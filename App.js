import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Home from './Home';
import Sudoku from './Sudoku';
import Success from './Success';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Home' component={Home}/>
        <Stack.Screen name='Sudoku' component={Sudoku}/>
        <Stack.Screen name='Success' component={Success}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}

