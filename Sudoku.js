import { StatusBar } from 'expo-status-bar';
import {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getSudoku } from 'sudoku-gen';

export default function Sudoku({ navigation, route}) {

    const [sudoku, setSudoku] = useState(null);
    console.log("Sudoku: ", route.params.difficulty.value);
    useEffect(() => {
        navigation.setOptions({title: "Sudoku "+ route.params.difficulty.label});
    });

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
        },
    });

    return (
        <View style={styles.container}>
            <Text>Open up App.js to start working on your app</Text>
            <StatusBar style="auto" />
        </View>
    );
}

