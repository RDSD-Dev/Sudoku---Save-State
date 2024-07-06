import {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

export default function Home() {
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({});
    });

    function navigateSudoku(){
        navigation.navigate('Sudoku');
    }

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
            <Text>Open up App.js to start working on your app!</Text>
            <Button title='Sudoku' onPress={() => navigateSudoku()}/>

            <StatusBar style="auto" />
        </View>
    );
}

