import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button, Pressable } from 'react-native';
import Checkbox from 'expo-checkbox';
import { getSudoku } from 'sudoku-gen';

export default function Sudoku({ navigation, route}) {
    const [sudoku, setSudoku] = useState(null);
    const [focus, setFocus] = useState(null);
    const [isTemp, setIsTemp] = useState(false);
    const [refresh, setRefresh] = useState('');

    useEffect(() => {
        if(sudoku == null){
            navigation.setOptions({title: "Sudoku "+ route.params.difficulty.label});
            buildBoard();
        }
    }, [focus, refresh]);

    function buildBoard(){
        if(route.params.sudoku == undefined){ // Make new board
            const sudokuStr = getSudoku(route.params.difficulty.value);
            let tempSudoku = {
                puzzleStr: sudokuStr.puzzle,
                solutionStr: sudokuStr.solution,
                difficulty: sudokuStr.difficulty,
                cells: [[], [], [], [], [], [], [], [], []],
            };
            let currentCell = 0;
            for(let i=0; i< sudokuStr.puzzle.length; i++){
                const currentPuzzle = sudokuStr.puzzle[i];
                const currentSolution = sudokuStr.solution[i];
                if(i % 3 == 0 && i !== 0){
                    if(currentCell == 2 && i < 27){ // First 27 cells go into cells 0 1 2.
                        currentCell = 0;
                    }
                    else if(currentCell == 5 && i < 54){ // 28 - 54 goes into cells 3 4 5.
                        currentCell = 3;
                    }
                    else if(currentCell == 8){ // 55 - 81 goes into cells 6 7 8
                        currentCell = 6;
                    }
                    else{
                        currentCell++;
                    }
                }
                const tempBox = {id: tempSudoku.cells[currentCell].length, cellId: currentCell, current: currentPuzzle, solution: currentSolution, temp: []};
                tempSudoku.cells[currentCell].push(tempBox);
            }
            saveSudoku(tempSudoku);
        }
        else{ // Remake board
            setSudoku(route.params.sudoku);
        }
    }
    function saveSudoku(tempSudoku){
        setSudoku(tempSudoku);
        AsyncStorage.setItem('sudoku', JSON.stringify(tempSudoku));
    }

    function changeFocus(cellId, boxId){
        setRefresh('');
        setFocus([cellId, boxId]);
    }
    function placeNumber(number){
        const box = sudoku.cells[focus[0]][focus[1]];
        if(box!== null && box.current !== box.solution){
            setRefresh(refresh + ' ');
            let tempSudoku = sudoku;
            tempSudoku.cells[focus[0]][focus[1]].current = number;
            saveSudoku(tempSudoku);
            console.log("Box: ", focus[0], " ", focus[1], " : ", number);
        }
    }

    function displayBoard(){
        return(
            <View style={styles.board}>
                <View style={styles.row}>
                    {displayCell(sudoku.cells[0])}
                    {displayCell(sudoku.cells[1])}
                    {displayCell(sudoku.cells[2])}
                </View>
                <View style={styles.row}>
                    {displayCell(sudoku.cells[3])}
                    {displayCell(sudoku.cells[4])}
                    {displayCell(sudoku.cells[5])}
                </View>
                <View style={styles.row}>
                    {displayCell(sudoku.cells[6])}
                    {displayCell(sudoku.cells[7])}
                    {displayCell(sudoku.cells[8])}
                </View>
            </View>
        );
    }
    function displayCell(cell){
        return(
            <View style={styles.cell}>
                <View style={styles.row}>
                    <Pressable onPress={() => changeFocus(cell[0].cellId, cell[0].id)}>
                        {displayBox(cell[0])}
                    </Pressable>
                    <Pressable onPress={() => changeFocus(cell[1].cellId, cell[1].id)}>
                        {displayBox(cell[1])}
                    </Pressable>
                    <Pressable onPress={() => changeFocus(cell[2].cellId, cell[2].id)}>
                        {displayBox(cell[2])}
                    </Pressable>
                </View>
                <View style={styles.row}>
                    <Pressable onPress={() => changeFocus(cell[3].cellId, cell[3].id)}>
                        {displayBox(cell[3])}
                    </Pressable>
                    <Pressable onPress={() => changeFocus(cell[4].cellId, cell[4].id)}>
                        {displayBox(cell[4])}
                    </Pressable>
                    <Pressable onPress={() => changeFocus(cell[5].cellId, cell[5].id)}>
                        {displayBox(cell[5])}
                    </Pressable>
                </View>
                <View style={styles.row}>
                    <Pressable onPress={() => changeFocus(cell[6].cellId, cell[6].id)}>
                        {displayBox(cell[6])}
                    </Pressable>
                    <Pressable onPress={() => changeFocus(cell[7].cellId, cell[7].id)}>
                        {displayBox(cell[7])}
                    </Pressable>
                    <Pressable onPress={() => changeFocus(cell[8].cellId, cell[8].id)}>
                        {displayBox(cell[8])}
                    </Pressable>
                </View>
            </View>
        );
    }
    function displayBox(box){
        if(box.current == box.solution){ // Display Solution
            return(
                <View>
                    {focus !== null && focus[0] == box.cellId && focus[1] == box.id && <Text style={styles.highlightBox}>{box.current}</Text>}
                    {(focus== null || focus[0] !== box.cellId || focus[1] !== box.id) && <Text style={styles.box}>{box.current}</Text>}
                </View>
            );
        }
        if(box.current !== '-'){
            return(
                <View>
                    {focus !== null && focus[0] == box.cellId && focus[1] == box.id && <Text style={styles.highlightBox}>{box.current}</Text>}
                    {(focus == null || focus[0] !== box.cellId || focus[1] !== box.id) && <Text style={styles.box}>{box.current}</Text>}
                </View>
            );
        }
        else{ // Display Temp
            return(
                <View>
                    {focus !== null && focus[0] == box.cellId && focus[1] == box.id && <Text style={styles.highlightBox}>{displayTemp(box)}</Text>}
                    {(focus== null || focus[0] !== box.cellId || focus[1] !== box.id) && <Text style={styles.box}>{displayTemp(box)}</Text>}
                </View>
            );
        }
    }
    function displayTemp(box){
        return(
            <Text> pp</Text>
        );
    }

    function displayNumbers(){
        return(
            <View style={styles.numbers}>
                <Button title='1' onPress={() => placeNumber(1)}/>
                <Button title='2' onPress={() => placeNumber(2)}/>
                <Button title='3' onPress={() => placeNumber(3)}/>
                <Button title='4' onPress={() => placeNumber(4)}/>
                <Button title='5' onPress={() => placeNumber(5)}/>
                <Button title='6' onPress={() => placeNumber(6)}/>
                <Button title='7' onPress={() => placeNumber(7)}/>
                <Button title='8' onPress={() => placeNumber(8)}/>
                <Button title='9' onPress={() => placeNumber(9)}/>
            </View>
        );
    }

    const styles = StyleSheet.create({
        board: {
            borderColor: 'blue',
            borderWidth: 2,
            borderStyle: 'solid',
            alignSelf: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            width: '96%',
            alignItems: 'center',
        },
        cell: {
            padding: 8,
            margin: 8,
            borderColor: 'black',
            borderStyle: 'solid',
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center'
        },
        box: {
            borderColor: 'grey',
            borderWidth: 1,
            borderStyle: 'solid',
            padding: 4,
            margin: 1,
            alignItems: 'center',
            alignSelf: 'center',
        },
        row: {
            flexDirection: 'row',
        },
        highlightBox: {
            borderColor: 'black',
            borderWidth: 2,
            borderStyle: 'solid',
            padding: 4,
            margin: 0,
            alignItems: 'center',
            alignSelf: 'center',
            backgroundColor: 'blue',
        },

        numbers: {
            flexDirection: 'row',
            alignContent: 'center',
        },
    

    });
    return (
        <View style={styles.container}>
            {sudoku !== null && displayBoard()}
            <Checkbox style={styles.checkbox} value={isTemp} onValueChange={setIsTemp} />
            {displayNumbers()}
            <StatusBar style="auto" />
        </View>
    );
}


