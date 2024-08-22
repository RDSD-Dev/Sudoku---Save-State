import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button, Pressable, Dimensions } from 'react-native';
import Checkbox from 'expo-checkbox';
import { getSudoku } from 'sudoku-gen';

export default function Sudoku({ navigation, route}) {
    const [sudoku, setSudoku] = useState(null);
    const [focus, setFocus] = useState(null);
    const [isTemp, setIsTemp] = useState(false);
    const [isLock, setIsLock] = useState(false);
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
                mistakes: 0,
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
        if(box!== null && box.current != box.solution){
            let tempSudoku = sudoku;
            if(isTemp){
                const tempIndex = tempSudoku.cells[focus[0]][focus[1]].temp.findIndex((e) => e == number);
                if(tempIndex == -1){
                    tempSudoku.cells[focus[0]][focus[1]].temp.push(number);
                }
                else{
                    tempSudoku.cells[focus[0]][focus[1]].temp.splice(tempIndex, 1);
                }
                saveSudoku(tempSudoku);
            }
            else{
                tempSudoku.cells[focus[0]][focus[1]].current = number;
                if(number != tempSudoku.cells[focus[0]][focus[1]].solution){
                    tempSudoku.mistakes++;
                }
                saveSudoku(tempSudoku);
            }
            setRefresh(refresh + ' ');
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
        let display = [' ',' ',' ',' ',' ',' ',' ',' ',' '];
        for(let i=0; i< box.temp.length; i++){
            const num = box.temp[i];
            display[num-1] = JSON.stringify(num);
        }
        return(
            <View style={styles.tempNums}>
                <View style={styles.row}>
                    <Text style={styles.tempNums}>{display[0]}</Text>
                    <Text style={styles.tempNums}>{display[1]}</Text>
                    <Text style={styles.tempNums}>{display[2]}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.tempNums}>{display[3]}</Text>
                    <Text style={styles.tempNums}>{display[4]}</Text>
                    <Text style={styles.tempNums}>{display[5]}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.tempNums}>{display[6]}</Text>
                    <Text style={styles.tempNums}>{display[7]}</Text>
                    <Text style={styles.tempNums}>{display[8]}</Text>
                </View>
            </View>
        );
    }

    function displayButton(title, onPress){
        return(
            <Pressable onPress={onPress}>
                <Text style={styles.number}>{title}</Text>
            </Pressable>
        );
    }
    function displayNumbers(){
        return(
            <View style={styles.numbers}>
                {displayButton('1', () => placeNumber(1))}
                {displayButton('2', () => placeNumber(2))}
                {displayButton('3', () => placeNumber(3))}
                {displayButton('4', () => placeNumber(4))}
                {displayButton('5', () => placeNumber(5))}
                {displayButton('6', () => placeNumber(6))}
                {displayButton('7', () => placeNumber(7))}
                {displayButton('8', () => placeNumber(8))}
                {displayButton('9', () => placeNumber(9))}
            </View>
        );
    }

    const windowWidth = Dimensions.get('window').width;
    const boxWidth = (windowWidth)/10;
    const styles = StyleSheet.create({
        board: {
            borderColor: 'blue',
            borderWidth: 2,
            borderStyle: 'solid',
            alignSelf: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            width: '100%',
            alignItems: 'center',
        },
        cell: {
            borderColor: 'black',
            borderStyle: 'solid',
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
        },
        box: {
            borderColor: 'grey',
            borderWidth: 1,
            borderStyle: 'solid',
            justifyContent: 'center',
            padding: 1,
            alignItems: 'center',
            alignSelf: 'center',
            width: boxWidth,
            height: boxWidth
        },
        row: {
            flexDirection: 'row',
        },
        highlightBox: {
            borderColor: 'black',
            borderWidth: 2,
            borderStyle: 'solid',
            padding: 1,
            alignItems: 'center',
            alignSelf: 'center',
            backgroundColor: 'light-blue',
            width: boxWidth,
            height: boxWidth
        },
        tempNums: {
            fontSize: 10,
        },

        numbers: {
            flexDirection: 'row',
            justifyContent: 'center',
            width: '100%',

        },
        number: {
            fontSize: 32,
            borderWidth: 1,
            borderColor: 'black',
            paddingHorizontal: 4,
            marginHorizontal: 4,
            marginVertical: 4,
        },

    });
    return (
        <View style={styles.container}>
            {sudoku !== null && <Text>{sudoku.mistakes}</Text>}
            {sudoku !== null && displayBoard()}
            <View style={[styles.row, {justifyContent: 'space-evenly'}]}>
                <View style={[styles.row]}>
                    <Text>Pencil</Text>
                    <Checkbox style={styles.checkbox} value={isTemp} onValueChange={setIsTemp} />
                </View>
                <View style={[styles.row]}>
                    <Text>Lock</Text>
                    <Checkbox style={styles.checkbox} value={isLock} onValueChange={setIsLock} />
                </View>
            </View>
            {displayNumbers()}
            <StatusBar style="auto" />
        </View>
    );
}


