import { StatusBar } from 'expo-status-bar';
import {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import Board from './classes/board';
import Cell from './classes/cell';
import Box from './classes/box';

export default function Sudoku({ navigation, route}) {
    const [sudoku, setSudoku] = useState(null);
    const [current, setCurrent] = useState(null);

    useEffect(() => {
        if(sudoku !== null){
            setCurrent(sudoku.focus);
            console.log("Current: ", current);
        }

        navigation.setOptions({title: "Sudoku "+ route.params.difficulty.label});
        if(sudoku == null){
            if(route.params.sudoku == null){ // Make new board
                setSudoku(new Board(route.params.difficulty.value));
            }
            else{ // Remake board

            }
        }
    });

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fff',
            justifyContent: 'center',
        },
    });

    return (
        <View style={styles.container}>
            {sudoku !== null && sudoku.displayBoard()}
            <StatusBar style="auto" />
        </View>
    );
}

