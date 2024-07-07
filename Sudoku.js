import { StatusBar } from 'expo-status-bar';
import {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { getSudoku } from 'sudoku-gen';

export default function Sudoku({ navigation, route}) {

    const [sudoku, setSudoku] = useState(null);
    console.log("Sudoku: ", route.params.difficulty.value);
    useEffect(() => {
        navigation.setOptions({title: "Sudoku "+ route.params.difficulty.label});
        console.log(sudoku);
        if(sudoku == null){
            if(route.params.sudoku == null){ // Make new board
                setSudoku(getSudoku(route.params.difficulty.value));
            }
            else{ // Remake board

            }
        }
    });

    function displaySudoku(){
        return(
            <Text>Display Sudoku board object that has a cell object that has individual box objects</Text>
        );
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fff',
            justifyContent: 'center',
        },
    });

    return (
        <View style={styles.container}>
            {sudoku !== null && displaySudoku()}
            <StatusBar style="auto" />
        </View>
    );
}

