import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button, Pressable, Dimensions } from 'react-native';
import Checkbox from 'expo-checkbox';
import { getSudoku } from 'sudoku-gen';

export default function Sudoku({ navigation, route}) {
    const [isActive, setIsActive] = useState(false);
    const [sudoku, setSudoku] = useState(null);
    const [focus, setFocus] = useState(null);
    const [highlighted, setHighlighted] = useState(null);
    const [highlightNum, setHighlightNum] = useState(null);
    const [isTemp, setIsTemp] = useState(false);
    const [isLock, setIsLock] = useState(false);
    const [lockNum, setLockNum] = useState(0);
    const [refresh, setRefresh] = useState('');

    useEffect(() => {
        if(sudoku == null){
            navigation.setOptions({title: "Sudoku "+ route.params.difficulty.label});
            buildBoard();
        }
        if(isLock && lockNum == 0 && focus !== null){
            const box = sudoku.boxes.find((e) => e.id == focus);
            console.log('Box: ', box);
            if(box.current !== '-'){
                setLockNum(box.current);
            }
        }
        else if(!isLock && lockNum !== 0){
            setLockNum(0);
        }
        if(sudoku !== null && sudoku.numbers[0].quantity == 0 && sudoku.numbers[1].quantity == 0 && sudoku.numbers[2].quantity == 0 && sudoku.numbers[3].quantity == 0 && sudoku.numbers[4].quantity == 0 && sudoku.numbers[5].quantity == 0 && sudoku.numbers[6].quantity == 0 && sudoku.numbers[7].quantity == 0  && sudoku.numbers[8].quantity == 0){
            // Game completed
            navigation.navigate('Success', {difficulty: route.params.difficulty.label});
            setSudoku(null);
            setFocus(null);
            setIsLock(false);
            setLockNum(0);
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
                numbers: [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id:6}, {id:7}, {id:8}, {id:9}]
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
            for(let i=1; i<=9; i++){
                tempSudoku.numbers[i-1].quantity = tempSudoku.boxes.filter((e) => e.current !== e.solution && e.solution == i).length;
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
        if(!isLock && focus == null){
            return;
        }
        if(!isLock){
            checkNumber(number);
        }
        else{
            setFocus(null);
            setHighlighted(null);
            setLockNum(number);
            setRefresh(refresh + ' ');
        }
    }
    function changeFocus(boxId){
        //console.log('Focus: ', sudoku.boxes.find((e) => e.id == boxId));
        setRefresh('');
        setFocus(boxId);
        const box = sudoku.boxes.find((e) => e.id == boxId);
        let highlight = [];
        highlight = sudoku.boxes.filter((e) => e.row == box.row || e.colum == box.colum || e.cellId == box.cellId);
        setHighlighted(highlight);
        if(box.current !== '-'){
            setHighlightNum(box.current);
        }
        if(isLock){
            if(box.current !== '-' && box.current == box.solution){
                pressNumber(box.current);
                setFocus(boxId);
                setHighlighted(highlight);

            }
            else if(lockNum !== 0){
                checkNumber(lockNum, boxId);
            }
        }
        setRefresh(refresh + ' ');
    }
    function checkNumber(number, boxId){
        if(boxId == undefined){
            boxId = focus;
        }
        //console.log(boxId, number);
        const box = sudoku.boxes.find((e) => e.id == boxId);
        let hasNumber = sudoku.boxes.filter((e) => e.cellId == box.cellId || e.row == box.row || e.colum == box.colum);
        hasNumber = hasNumber.filter((e) => e.current == number && e.solution == number);
        if(isTemp && hasNumber.length !== 0){
            return;
        }
        if(box.current != box.solution && box.current == number){
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
                number = JSON.parse(number);
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
                    let tempHasNumber = sudoku.boxes.filter((e) => e.row == box.row || e.colum == box.colum || e.cellId == box.cellId);
                    let hasNumber = [];
                    for(let i=0; i<tempHasNumber.length; i++){
                        const current = tempHasNumber[i];

                        if(current.temp.indexOf(JSON.parse(number)) !== -1){
                            hasNumber.push(current);
                        }
                    }
                    for(let i=0; i<hasNumber.length; i++){
                        const index = tempSudoku.boxes.indexOf(hasNumber[i]);
                        const tempIndex = tempSudoku.boxes[index].temp.indexOf(number);
                        tempSudoku.boxes[index].temp.splice(tempIndex, 1);
                    }
                    tempSudoku.numbers[number-1].quantity = tempSudoku.numbers[number-1].quantity -1;
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
                <View>
                    {(focus == null || focus !== box.id) && box.current != highlightNum && <View style={style}><Text style={[styles.box, styles.textColor]}>{box.current}</Text></View>}
                    {focus !== null && focus == box.id && <View style={[style, styles.focus] }><Text style={[styles.box, styles.textColor]}>{box.current}</Text></View>}
                    {(focus == null || focus !== box.id) && box.current == highlightNum && <View style={[style, styles.boxHighlightNum]}><Text style={[styles.box, styles.textColor]}>{box.current}</Text></View>}
                </View>
            );
        }
        else if(box.current !== '-'){
            return(
                <View>
                    {(focus== null || focus !== box.id) && <View style={[style, styles.boxWrong]}><Text style={[styles.box, styles.boxWrong, styles.textColor]}>{box.current}</Text></View>}
                    {focus !== null && focus == box.id && <View style={[style, styles.focus] }><Text style={[styles.box, styles.boxWrong, styles.textColor]}>{box.current}</Text></View>}
                </View>
            );
        }
        else{ // Display Temp boxWrong
            return(
                <View>
                    {(focus== null || focus !== box.id) && <View style={style}><Text style={[styles.box, styles.textColor]}>{displayTemp(box)}</Text></View>}
                    {focus !== null && focus == box.id && <View style={[style, styles.focus] }><Text style={[styles.box, styles.textColor]}>{displayTemp(box)}</Text></View>}
                </View>
            );
        }
    }
    function displayTemp(box){
        let display = [' ',' ',' ',' ',' ',' ',' ',' ',' '];
        let hasTemp = false;

        for(let i=0; i< box.temp.length; i++){
            const num = box.temp[i];
            if(num == highlightNum){
                hasTemp = true;
            }
            display[num-1] = JSON.stringify(num);
        }
        return(
            <View style={[styles.tempNums, hasTemp ? styles.boxHighlightNum : styles.tempNums]}>
                <View style={styles.tempRow}>
                    <Text style={[styles.tempNum, styles.textColor]}>{display[0]}</Text>
                    <Text style={[styles.tempNum, styles.textColor]}>{display[1]}</Text>
                    <Text style={[styles.tempNum, styles.textColor]}>{display[2]}</Text>
                </View>
                <View style={styles.tempRow}>
                    <Text style={[styles.tempNum, styles.textColor]}>{display[3]}</Text>
                    <Text style={[styles.tempNum, styles.textColor]}>{display[4]}</Text>
                    {highlightNum != 6 && <Text style={[styles.tempNum, styles.textColor]}>{display[5]}</Text>}
                    {display[5] !== ' ' && highlightNum == 6 && <Text style={[styles.tempNum, styles.highlightTemp, styles.textColor]}>{display[5]}</Text>}
                </View>
                <View style={styles.tempRow}>
                    <Text style={[styles.tempNum, styles.textColor]}>{display[6]}</Text>
                    <Text style={[styles.tempNum, styles.textColor]}>{display[7]}</Text>
                    <Text style={[styles.tempNum, styles.textColor]}>{display[8]}</Text>
                </View>
            </View>
        );
    }

    function displayButton(title, onPress, style){
        return(
            <View>
                {((title == JSON.stringify(lockNum) || title == lockNum)&& isLock) && <Pressable onPress={onPress} style={[styles.highlightNumber, styles.numberBox, style]}><Text style={[style, styles.highlightNumber, styles.textColor]}>{title}</Text></Pressable>}
                {((title !== JSON.stringify(lockNum) && title !== lockNum)|| !isLock) && <Pressable onPress={onPress} style={[styles.numberBox, style]}><Text style={[styles.number, style, styles.textColor]}>{title}</Text></Pressable>}
            </View>
        );
    }
    function displayNumbers(){
        return(
            <View style={styles.numbers}>
                <View style={{alignItems: 'center'}}>
                    {displayButton('1', () => pressNumber(1), sudoku.numbers[0].quantity>0 ? null : styles.finishedNumber)}
                    <Text style={[styles.numberQuantity, sudoku.numbers[0].quantity>0 ? null : styles.finishedNumber]}>{sudoku.numbers[0].quantity}</Text>
                </View>
                <View style={{alignItems: 'center'}}>
                    {displayButton('2', () => pressNumber(2), sudoku.numbers[1].quantity>0 ? null : styles.finishedNumber)}
                    <Text style={[styles.numberQuantity, sudoku.numbers[1].quantity>0 ? null : styles.finishedNumber]}>{sudoku.numbers[1].quantity}</Text>
                </View>
                <View style={{alignItems: 'center'}}>
                    {displayButton('3', () => pressNumber(3), sudoku.numbers[2].quantity>0 ? null : styles.finishedNumber)}
                    <Text style={[styles.numberQuantity, sudoku.numbers[2].quantity>0 ? null : styles.finishedNumber]}>{sudoku.numbers[2].quantity}</Text>
                </View>
                <View style={{alignItems: 'center'}}>
                    {displayButton('4', () => pressNumber(4), sudoku.numbers[3].quantity>0 ? null : styles.finishedNumber)}
                    <Text style={[styles.numberQuantity, sudoku.numbers[3].quantity>0 ? null : styles.finishedNumber]}>{sudoku.numbers[3].quantity}</Text>
                </View>
                <View style={{alignItems: 'center'}}>
                    {displayButton('5', () => pressNumber(5), sudoku.numbers[4].quantity>0 ? null : styles.finishedNumber)}
                    <Text style={[styles.numberQuantity, sudoku.numbers[4].quantity>0 ? null : styles.finishedNumber]}>{sudoku.numbers[4].quantity}</Text>
                </View>
                <View style={{alignItems: 'center'}}>
                    {displayButton('6', () => pressNumber(6), sudoku.numbers[5].quantity>0 ? null : styles.finishedNumber)}
                    <Text style={[styles.numberQuantity, sudoku.numbers[5].quantity>0 ? null : styles.finishedNumber]}>{sudoku.numbers[5].quantity}</Text>
                </View>
                <View style={{alignItems: 'center'}}>
                    {displayButton('7', () => pressNumber(7), sudoku.numbers[6].quantity>0 ? null : styles.finishedNumber)}
                    <Text style={[styles.numberQuantity, sudoku.numbers[6].quantity>0 ? null : styles.finishedNumber]}>{sudoku.numbers[6].quantity}</Text>
                </View>
                <View style={{alignItems: 'center'}}>
                    {displayButton('8', () => pressNumber(8), sudoku.numbers[7].quantity>0 ? null : styles.finishedNumber)}
                    <Text style={[styles.numberQuantity, sudoku.numbers[7].quantity>0 ? null : styles.finishedNumber]}>{sudoku.numbers[7].quantity}</Text>
                </View>
                <View style={{alignItems: 'center'}}>
                    {displayButton('9', () => pressNumber(9), sudoku.numbers[8].quantity>0 ? null : styles.finishedNumber)}
                    <Text style={[styles.numberQuantity, sudoku.numbers[8].quantity>0 ? null : styles.finishedNumber]}>{sudoku.numbers[8].quantity}</Text>
                </View>
            </View>
        );
    }

    // #2B2223 #33292A #584443 #D9A198 #E94F37
    const windowWidth = Dimensions.get('window').width;
    const boxWidth = (windowWidth)/9.4;
    const styles = StyleSheet.create({
        container: {
            backgroundColor: '#2B2223',
            height: '100%',
        },

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
            width: boxWidth,
            height: boxWidth,
            borderColor: 'grey',
            borderWidth: 1,
            borderStyle: 'solid',
            justifyContent: 'center',
        },
        box: {
            fontSize: 20,
            justifyContent: 'center',
            alignSelf: 'center',
            alignContent: 'center',
        },
        row: {
            flexDirection: 'row',
        },
        highlightBox: {
            borderWidth: 2,
        },
        focus: {
            borderWidth: 2,
            borderColor: 'blue',
        },
        boxWrong: {
            borderColor: 'red',
            color: 'red',
        },
        boxHighlightNum: {
            borderColor: 'blue',
            borderWidth: 1,
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
        numberQuantity: {
            justifyContent: 'center',
        },
        finishedNumber: {
            borderColor: 'grey',
            color: 'grey',
        },

        tempRow: {
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignContent: 'space-evenly',
        },
        tempNums: {
            width: boxWidth,
            justifyContent: 'space-evenly',
        },
        tempNum: {
            fontSize: 10,
            justifyContent: 'space-evenly',
            alignSelf: 'space-evenly',
        },
        highlightTemp: {
            color: 'blue',
        },

        textColor: {
            color: 'white',
        },

    });
    return (
        <View style={styles.container}>
            {sudoku !== null && <Text>Mistakes: {sudoku.mistakes}</Text>}
            {sudoku !== null && displayBoard()}

            <View style={[styles.row, {justifyContent: 'space-evenly'}]}>
                <View style={[styles.row]}>
                    <Text style={[styles.textColor]}>Pencil</Text>
                    <Checkbox style={styles.checkbox} value={isTemp} onValueChange={(itemValue) => {setIsTemp(itemValue); setRefresh( refresh + ' ')}} />
                </View>
                <View style={[styles.row]}>
                    <Text style={[styles.textColor]}>Lock</Text>
                    <Checkbox style={styles.checkbox} value={isLock} onValueChange={(itemValue) => {setIsLock(itemValue); setRefresh(refresh + ' ')}} />
                </View>
                <View style={[styles.row]}>
                   {displayButton('Save', ()=>saveState())}
                </View>
                <View style={[styles.row]}>
                   {displayButton('Load', ()=>loadState())}
                </View>
            </View>

            {sudoku !== null && displayNumbers()}
            <StatusBar style="auto" />
        </View>
    );
}


