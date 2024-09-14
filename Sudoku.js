import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button, Pressable, Dimensions } from 'react-native';
import Checkbox from 'expo-checkbox';
import { getSudoku } from 'sudoku-gen';

export default function Sudoku({ navigation, route}) {
    const [sudoku, setSudoku] = useState(null);
    const [focus, setFocus] = useState(null);
    const [highlighted, setHighlighted] = useState(null);
    const [isTemp, setIsTemp] = useState(false);
    const [isLock, setIsLock] = useState(false);
    const [lockNum, setLockNum] = useState(0);
    const [refresh, setRefresh] = useState('');

    useEffect(() => {
        console.log(lockNum);
        if(sudoku == null){
            navigation.setOptions({title: "Sudoku "+ route.params.difficulty.label});
            buildBoard();
        }
    }, [focus, refresh, lockNum]);

    function buildBoard(){
        if(route.params.sudoku == undefined){ // Make new board
            const sudokuStr = getSudoku(route.params.difficulty.value);
            let tempSudoku = {
                puzzleStr: sudokuStr.puzzle,
                solutionStr: sudokuStr.solution,
                difficulty: sudokuStr.difficulty,
                boxes: [],
                mistakes: 0,
            };
            let currentCell = 0;
            let currentColumn = 0;
            let currentRow = 0;
            for(let i=0; i< sudokuStr.puzzle.length; i++, currentColumn++){
                const currentBox = i+1;
                const currentRowPP = currentRow+1;
                const currentPuzzle = sudokuStr.puzzle[i];
                const currentSolution = sudokuStr.solution[i];

                if(currentColumn == 9){
                    currentColumn = 0;
                }

                let tempBox = {id: tempSudoku.boxes.length, cellId: currentCell, current: currentPuzzle, solution: currentSolution, temp: [], row: currentRow, colum: currentColumn};

                if(currentBox % 3 == 0){ // If we are entering a new cell
                    currentCell++;
                    if(currentBox % 9 == 0){ // If not done with set of cells
                        if(currentRowPP % 3 !== 0){
                            currentCell -= 3;
                        }
                        currentRow++;
                    }
                }

                tempSudoku.boxes.push(tempBox);
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

    function pressNumber(number){
        if(!isLock){
            checkNumber(number);
        }
        else{
            setLockNum(number);
        }
    }
    function changeFocus(boxId){
        console.log('Focus: ', sudoku.boxes.find((e) => e.id == boxId));
        setRefresh('');
        setFocus(boxId);
        const box = sudoku.boxes.find((e) => e.id == boxId);
        let highlight = [];
        highlight = sudoku.boxes.filter((e) => e.row == box.row || e.colum == box.colum || e.cellId == box.cellId);
        setHighlighted(highlight);
        if(isLock){
            if(box.current !== '-'){
                pressNumber(box.current);
            }
            else{
                checkNumber(lockNum, boxId);
            }
        }
        setRefresh(refresh + ' ');
    }
    function checkNumber(number, boxId){
        if(boxId == undefined){
            boxId = focus;
        }
        console.log(boxId, number);
        const box = sudoku.boxes.find((e) => e.id == boxId);
        let hasNumber = sudoku.boxes.filter((e) => e.cellId == box.cellId || e.row == box.row || e.colum == box.colum);
        hasNumber = hasNumber.filter((e) => e.current == number && e.solution == number);
        if(isTemp && hasNumber.length !== 0){
            return;
        }
        if(box.current !== box.solution && box.current == number){
            let tempSudoku = sudoku;
            const index = tempSudoku.boxes.findIndex((e) => e.id == box.id);
            tempSudoku.boxes[index].current = '-';
            saveSudoku(tempSudoku);
            setRefresh(refresh + ' ');
            return;
        }

        placeNumber(number, boxId);
    }
    function placeNumber(number, boxId){
        if(boxId == undefined){
            boxId = focus;
        }
        const box = sudoku.boxes.find((e) => e.id == boxId);
        if(box!== null && box.current != box.solution){
            let tempSudoku = sudoku;
            const boxIndex = tempSudoku.boxes.findIndex((e) => e.id == boxId);

            if(isTemp){
                const tempIndex = tempSudoku.boxes[boxIndex].temp.findIndex((e) => e == number);
                if(tempIndex == -1){
                    tempSudoku.boxes[boxIndex].temp.push(number);
                }
                else{
                    tempSudoku.boxes[boxIndex].temp.splice(tempIndex, 1);
                }
                saveSudoku(tempSudoku);
            }
            else{
                tempSudoku.boxes[boxIndex].current = number;
                if(box.solution == number){
                    let hasNumber = sudoku.boxes.filter((e) => e.cellId == box.cellId || e.row == box.row || e.colum == box.colum);
                    hasNumber = hasNumber.filter((e) => e.solution !== e.current && e.temp.indexOf(number) !== -1);
                    for(let i=0; i<hasNumber.length; i++){
                        const index = tempSudoku.boxes.indexOf(hasNumber[i]);
                        const tempIndex = tempSudoku.boxes[index].temp.indexOf(number);
                        tempSudoku.boxes[index].temp.splice(tempIndex, 1);
                    }
                }
                else if(tempSudoku.boxes[boxIndex].current !== tempSudoku.boxes[boxIndex].solution){
                    tempSudoku.mistakes++;
                }
                saveSudoku(tempSudoku);
            }
            setRefresh(refresh + ' ');
        }
    }
    function saveState(){
        let tempSudoku = sudoku;
        tempSudoku.state = [];
        for(let i=0; i<tempSudoku.boxes.length; i++){
            const box = tempSudoku.boxes.find((e) => e.id == i);
            if(box.current !== box.solution && box.temp.length !== 0){
                const stateBox = JSON.stringify(box);
                tempSudoku.state.push(JSON.parse(stateBox));
            }
        }
        saveSudoku(tempSudoku);
        console.log('Saved state', tempSudoku.state);
    }
    function loadState(){
        let tempSudoku = sudoku;
        for(let i=0; i<tempSudoku.state.length; i++){
            const stateBox = tempSudoku.state[i];
            const box = tempSudoku.boxes.find((e) => e.id == stateBox.id);
            if(box.current !== box.solution && stateBox.temp !== box.temp){
                const index = tempSudoku.boxes.findIndex((e) => e.id == box.id);
                tempSudoku.boxes[index].temp = [];
                for(let y=0; y<stateBox.temp.length; y++){
                    let hasNumber = tempSudoku.boxes.filter((e) => e.cellId == box.cellId || e.row == box.row || e.colum == box.colum);
                    hasNumber = hasNumber.filter((e) => e.current == stateBox.temp[y] && e.solution == stateBox.temp[y]);
                    console.log(hasNumber);
                    if(hasNumber.length == 0){
                        tempSudoku.boxes[index].temp.push(stateBox.temp[y]);
                    }
                }
            }
        }
        saveSudoku(tempSudoku);
        setRefresh(refresh + ' ');
        console.log('Loaded State');
    }

    function displayBoard(){
        return(
            <View style={styles.board}>
                <View style={styles.row}>
                    {displayCell(sudoku.boxes.filter((e) => e.cellId == 0))}
                    {displayCell(sudoku.boxes.filter((e) => e.cellId == 1))}
                    {displayCell(sudoku.boxes.filter((e) => e.cellId == 2))}
                </View>
                <View style={styles.row}>
                    {displayCell(sudoku.boxes.filter((e) => e.cellId == 3))}
                    {displayCell(sudoku.boxes.filter((e) => e.cellId == 4))}
                    {displayCell(sudoku.boxes.filter((e) => e.cellId == 5))}
                </View>
                <View style={styles.row}>
                    {displayCell(sudoku.boxes.filter((e) => e.cellId == 6))}
                    {displayCell(sudoku.boxes.filter((e) => e.cellId == 7))}
                    {displayCell(sudoku.boxes.filter((e) => e.cellId == 8))}
                </View>
            </View>
        );
    }
    function displayCell(cell){
        return(
            <View style={styles.cell}>
                <View style={styles.row}>
                    <Pressable onPress={() => changeFocus(cell[0].id)}>
                        {displayBox(cell[0])}
                    </Pressable>
                    <Pressable onPress={() => changeFocus(cell[1].id)}>
                        {displayBox(cell[1])}
                    </Pressable>
                    <Pressable onPress={() => changeFocus(cell[2].id)}>
                        {displayBox(cell[2])}
                    </Pressable>
                </View>
                <View style={styles.row}>
                    <Pressable onPress={() => changeFocus(cell[3].id)}>
                        {displayBox(cell[3])}
                    </Pressable>
                    <Pressable onPress={() => changeFocus(cell[4].id)}>
                        {displayBox(cell[4])}
                    </Pressable>
                    <Pressable onPress={() => changeFocus(cell[5].id)}>
                        {displayBox(cell[5])}
                    </Pressable>
                </View>
                <View style={styles.row}>
                    <Pressable onPress={() => changeFocus(cell[6].id)}>
                        {displayBox(cell[6])}
                    </Pressable>
                    <Pressable onPress={() => changeFocus(cell[7].id)}>
                        {displayBox(cell[7])}
                    </Pressable>
                    <Pressable onPress={() => changeFocus(cell[8].id)}>
                        {displayBox(cell[8])}
                    </Pressable>
                </View>
            </View>
        );
    }
    function displayBox(box){
        let style = [styles.boxShell];
        if(highlighted !== null && highlighted.findIndex((e) => e.id == box.id) !== -1){
            style.push(styles.highlightBox);
        }
        if(box.current == box.solution){ // Display Solution
            return(
                <View style={style}>
                    {focus !== null && focus == box.id && <Text style={[styles.highlightBox, styles.focus]}>{box.current}</Text>}
                    {(focus== null || focus !== box.id) && <Text style={styles.box}>{box.current}</Text>}
                </View>
            );
        }
        if(box.current !== '-'){
            return(
                <View style={style}>
                    {focus !== null && focus == box.id && <Text style={[styles.highlightBox, styles.focus]}>{box.current}</Text>}
                    {(focus == null || focus !== box.id) && <Text style={styles.box}>{box.current}</Text>}
                </View>
            );
        }
        else{ // Display Temp
            return(
                <View style={style}>
                    {focus !== null && focus == box.id && <Text style={[styles.highlightBox, styles.focus]}>{displayTemp(box)}</Text>}
                    {(focus== null || focus !== box.id) && <Text style={styles.box}>{displayTemp(box)}</Text>}
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
        let style = styles.number;
        if(title == JSON.stringify(lockNum) && isLock){
            style = styles.highlightNumber;
        }
        return(
            <View>
                {((title == JSON.stringify(lockNum) || title == lockNum)&& isLock) && <Pressable onPress={onPress} style={[styles.highlightNumber, styles.numberBox]}><Text style={styles.highlightNumber}>{title}</Text></Pressable>}
                {((title !== JSON.stringify(lockNum) && title !== lockNum)|| !isLock) && <Pressable onPress={onPress} style={[styles.numberBox]}><Text style={styles.number}>{title}</Text></Pressable>}
            </View>
        );
    }
    function displayNumbers(){
        return(
            <View style={styles.numbers}>
                {displayButton('1', () => pressNumber(1))}
                {displayButton('2', () => pressNumber(2))}
                {displayButton('3', () => pressNumber(3))}
                {displayButton('4', () => pressNumber(4))}
                {displayButton('5', () => pressNumber(5))}
                {displayButton('6', () => pressNumber(6))}
                {displayButton('7', () => pressNumber(7))}
                {displayButton('8', () => pressNumber(8))}
                {displayButton('9', () => pressNumber(9))}
            </View>
        );
    }

    const windowWidth = Dimensions.get('window').width;
    const boxWidth = (windowWidth)/9.4;
    const styles = StyleSheet.create({
        board: {
            borderColor: 'blue',
            borderWidth: 0,
            padding: 0,
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
            padding: 1,
            margin: 0,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
        },
        boxShell: {
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
        },
        box: {
            width: boxWidth,
            height: boxWidth,
            alignContent: 'center',
            borderColor: 'grey',
            borderWidth: 1,
            borderStyle: 'solid',
            justifyContent: 'center',
            padding: 0,
            margin: 0,
            alignItems: 'center',
            alignSelf: 'center',
        },
        row: {
            flexDirection: 'row',
        },
        highlightBox: {
            width: boxWidth,
            height: boxWidth,
            borderColor: 'black',
            borderWidth: 2,
            borderStyle: 'solid',
            padding: 1,
            alignItems: 'center',
            alignSelf: 'center',
            backgroundColor: 'light-blue',
        },
        tempNums: {
            fontSize: 10,
        },
        focus: {
            borderWidth: 2,
            borderColor: 'blue',
        }, 

        numbers: {
            flexDirection: 'row',
            justifyContent: 'center',
            width: '100%',

        },
        numberBox: {
            borderWidth: 1,
            borderColor: 'black',
            paddingHorizontal: 4,
            marginHorizontal: 4,
            marginVertical: 4,
        },
        number: {
            fontSize: 32,

        },
        highlightNumber: {
            fontSize: 32,
            color: 'blue',
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
                <View style={[styles.row]}>
                   {displayButton('Save', ()=>saveState())}
                </View>
                <View style={[styles.row]}>
                   {displayButton('Load', ()=>loadState())}
                </View>
            </View>
            {displayNumbers()}
            <StatusBar style="auto" />
        </View>
    );
}


