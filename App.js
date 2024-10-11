import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Modal, Pressable, Dimensions } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getSudoku } from 'sudoku-gen';
import {decodeEntity, decode} from 'html-entities';

export default function App() {
  const difficulties = [
    {label: 'Easy', value: 'easy'},
    {label: 'Medium', value: 'medium'},
    {label: 'Hard', value: 'hard'},
    {label: 'Expert', value: 'expert'},
  ];
  const [settings, setSettings] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [sudoku, setSudoku] = useState(null);
  const [focus, setFocus] = useState(null);
  const [highlighted, setHighlighted] = useState(null);
  const [highlightNum, setHighlightNum] = useState(null);
  const [isTemp, setIsTemp] = useState(false);
  const [isLock, setIsLock] = useState(false);
  const [lockNum, setLockNum] = useState(0);
  const [refresh, setRefresh] = useState('');
  const [finishStats, setFinishStats] = useState(null);

  useEffect(() => {
      if(settings == null){
          const value = AsyncStorage.getItem('settings').then((value) => {
              if(value == null){ // Make new settings 
                  console.log("Making Settings");
                  const tempSettings = {
                      difficulty: difficulties[0],
                      sudoku: null,
                      stats: [{difficulty: 'easy', gameQuantity: 0, averageMistakesMade: 0},
                        {difficulty: 'medium', gameQuantity: 0, averageMistakesMade: 0},
                        {difficulty: 'hard', gameQuantity: 0, averageMistakesMade: 0},
                        {difficulty: 'expert', gameQuantity: 0, averageMistakesMade: 0}
                      ],
                  }
                  saveSettings(tempSettings);
              }
              else{ // Save settings
                  const tempSettings = JSON.parse(value);
                  setSettings(tempSettings);
                  setDifficulty(tempSettings.difficulty);
              }
          });
      }
      if(sudoku == null){
          AsyncStorage.getItem('sudoku').then((value) => {
              setSudoku(JSON.parse(value));
          });
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
      if(finishStats == null && sudoku !== null && sudoku.numbers[0].quantity == 0 && sudoku.numbers[1].quantity == 0 && sudoku.numbers[2].quantity == 0 && sudoku.numbers[3].quantity == 0 && sudoku.numbers[4].quantity == 0 && sudoku.numbers[5].quantity == 0 && sudoku.numbers[6].quantity == 0 && sudoku.numbers[7].quantity == 0  && sudoku.numbers[8].quantity == 0){
          // Game completed
          let tempSettings = settings;
          setFinishStats({mistakes: sudoku.mistakes, difficulty: sudoku.difficulty});
          const statIndex = tempSettings.stats.findIndex((e) => e.difficulty == difficulty.value);
          const tempGameQuantity = tempSettings.stats[statIndex].gameQuantity;
          let tempAverage = tempSettings.stats[statIndex].averageMistakesMade
          tempAverage = tempAverage * tempGameQuantity;
          tempAverage = tempAverage + sudoku.mistakes;
          tempAverage = tempAverage / tempGameQuantity + 1;
          tempSettings.stats[statIndex].gameQuantity = tempGameQuantity +1;
          tempSettings.sudoku = null;
          AsyncStorage.setItem('settings', JSON.stringify(tempSettings));
          setSettings(tempSettings);
          setSudoku(null);
          setFocus(null);
          setIsLock(false);
          setLockNum(0);
          setIsActive(false);
      }
  }, [focus, refresh, lockNum]);

  function saveSettings(tempSettings){
      AsyncStorage.setItem('settings', JSON.stringify(tempSettings));
      setSettings(tempSettings);
  }
  function updateDifficulty(item){
      setDifficulty(item);
      let tempSettings = settings;
      tempSettings.difficulty = item;
      saveSettings(tempSettings);
  }
  function buildBoard(){
      const sudokuStr = getSudoku(difficulty.value);
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
          setHighlightNum(number);
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
      else if(!isLock || highlightNum !== lockNum){
          setHighlightNum(0);
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

  function displayEmptyBoard(){
      const emptyBox = {id: 0, current: '-', solution: '0', temp: []};
      const emptyCell = [emptyBox, emptyBox,emptyBox,emptyBox,emptyBox,emptyBox,emptyBox,emptyBox,emptyBox]
      return(
          <View style={styles.board}>
              <View style={styles.row}>
                  {displayCell(emptyCell)}
                  {displayCell(emptyCell)}
                  {displayCell(emptyCell)}
              </View>
              <View style={styles.row}>
                  {displayCell(emptyCell)}
                  {displayCell(emptyCell)}
                  {displayCell(emptyCell)}
              </View>
              <View style={styles.row}>
                  {displayCell(emptyCell)}
                  {displayCell(emptyCell)}
                  {displayCell(emptyCell)}
              </View>
          </View>
      );
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
      else if(box.current !== '-'){ // Display Incorrect 
          return(
              <View>
                  {(focus== null || focus !== box.id) && <View style={[style, styles.boxWrong]}><Text style={[styles.box, styles.textColor]}>{box.current}</Text></View>}
                  {focus !== null && focus == box.id && <View style={[style, styles.focus,styles.boxWrong] }><Text style={[styles.box, styles.boxWrong, styles.textColor]}>{box.current}</Text></View>}
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
              {((title == JSON.stringify(lockNum) || title == lockNum)&& isLock) && <Pressable onPress={onPress} style={[styles.highlightNumber, styles.numberBox, style]}><Text style={[styles.highlightNumber, styles.textColor, style]}>{title}</Text></Pressable>}
              {((title !== JSON.stringify(lockNum) && title !== lockNum)|| !isLock) && <Pressable onPress={onPress} style={[styles.numberBox, style]}><Text style={[styles.number, styles.textColor, style]}>{title}</Text></Pressable>}
          </View>
      );
  }
  function displayNumbers(isEmpty){
      return(
          <View style={styles.numbers}>
              <View style={{alignItems: 'center'}}>
                  {displayButton('1', () => pressNumber(1), (isEmpty !== undefined || sudoku.numbers[0].quantity>0) ? null : styles.finishedNumber)}
                  <Text style={[styles.numberQuantity, (isEmpty !== undefined || sudoku.numbers[0].quantity>0) ? null : styles.finishedNumber]}>{isEmpty !== undefined ? 9 : sudoku.numbers[0].quantity}</Text>
              </View>
              <View style={{alignItems: 'center'}}>
                  {displayButton('2', () => pressNumber(2), (isEmpty !== undefined || sudoku.numbers[1].quantity>0) ? null : styles.finishedNumber)}
                  <Text style={[styles.numberQuantity, (isEmpty !== undefined || sudoku.numbers[1].quantity>0) ? null : styles.finishedNumber]}>{isEmpty !== undefined ? 9 : sudoku.numbers[1].quantity}</Text>
              </View>
              <View style={{alignItems: 'center'}}>
                  {displayButton('3', () => pressNumber(3), (isEmpty !== undefined || sudoku.numbers[2].quantity>0 )? null : styles.finishedNumber)}
                  <Text style={[styles.numberQuantity, (isEmpty !== undefined || sudoku.numbers[2].quantity>0) ? null : styles.finishedNumber]}>{isEmpty !== undefined ? 9 : sudoku.numbers[2].quantity}</Text>
              </View>
              <View style={{alignItems: 'center'}}>
                  {displayButton('4', () => pressNumber(4), (isEmpty !== undefined || sudoku.numbers[3].quantity>0) ? null : styles.finishedNumber)}
                  <Text style={[styles.numberQuantity, (isEmpty !== undefined || sudoku.numbers[3].quantity>0) ? null : styles.finishedNumber]}>{isEmpty !== undefined ? 9 : sudoku.numbers[3].quantity}</Text>
              </View>
              <View style={{alignItems: 'center'}}>
                  {displayButton('5', () => pressNumber(5), (isEmpty !== undefined || sudoku.numbers[4].quantity>0) ? null : styles.finishedNumber)}
                  <Text style={[styles.numberQuantity, (isEmpty !== undefined || sudoku.numbers[4].quantity>0) ? null : styles.finishedNumber]}>{isEmpty !== undefined ? 9 : sudoku.numbers[4].quantity}</Text>
              </View>
              <View style={{alignItems: 'center'}}>
                  {displayButton('6', () => pressNumber(6), (isEmpty !== undefined || sudoku.numbers[5].quantity>0 )? null : styles.finishedNumber)}
                  <Text style={[styles.numberQuantity, (isEmpty !== undefined || sudoku.numbers[5].quantity>0) ? null : styles.finishedNumber]}>{isEmpty !== undefined ? 9 : sudoku.numbers[5].quantity}</Text>
              </View>
              <View style={{alignItems: 'center'}}>
                  {displayButton('7', () => pressNumber(7), (isEmpty !== undefined || sudoku.numbers[6].quantity>0) ? null : styles.finishedNumber)}
                  <Text style={[styles.numberQuantity, (isEmpty !== undefined || sudoku.numbers[6].quantity>0) ? null : styles.finishedNumber]}>{isEmpty !== undefined ? 9 : sudoku.numbers[6].quantity}</Text>
              </View>
              <View style={{alignItems: 'center'}}>
                  {displayButton('8', () => pressNumber(8), (isEmpty !== undefined || sudoku.numbers[7].quantity>0) ? null : styles.finishedNumber)}
                  <Text style={[styles.numberQuantity, (isEmpty !== undefined || sudoku.numbers[7].quantity>0) ? null : styles.finishedNumber]}>{isEmpty !== undefined ? 9 : sudoku.numbers[7].quantity}</Text>
              </View>
              <View style={{alignItems: 'center'}}>
                  {displayButton('9', () => pressNumber(9), (isEmpty !== undefined || sudoku.numbers[8].quantity>0 )? null : styles.finishedNumber)}
                  <Text style={[styles.numberQuantity, (isEmpty !== undefined || sudoku.numbers[8].quantity>0) ? null : styles.finishedNumber]}>{isEmpty !== undefined ? 9 : sudoku.numbers[8].quantity}</Text>
              </View>
          </View>
      );
  }

  // #2B2223 #33292A #584443 #D9A198 #E94F37
  const theme = {
      background: '#191919',
      cellBorder: '#3f3f3f',
      boxBorder: '#343434',
      boxBackground: '#575757',
      focus: '#717171',
      highlight: '#282828',
      text: '#DADADA',
  }

  const windowWidth = Dimensions.get('window').width;
  const boxWidth = (windowWidth)/9.4;
  const styles = StyleSheet.create({
      container: {
          backgroundColor: theme.background,
          height: '100%',
      },

      header: {
        marginVertical: 16,
        marginBottom: 8,
        padding: 8,
        paddingBottom: 4,
        width: '100&',
        flexDirection: 'row',
        verticalAlign: 'middle',
      },
      headerText: {
        color: theme.text,
        fontSize: 24,
        verticalAlign: 'middle',
        marginRight: 8,
      },

      modalView: {
          margin: 20,
          backgroundColor: theme.highlight,
          borderRadius: 8,
          borderColor: theme.focus,
          borderWidth: 8,
          padding: 36,
          height: '92%',
          alignItems: 'center',
          shadowColor: '#000',
          justifyContent: 'center',
          shadowOffset: {
            width: 0,
            height: 2,
          },
      },
      input: {
          width: 140,
          margin: 16,
          height: 50,
          color: theme.text,
          fontSize: 16,
          borderBottomColor: 'gray',
          borderBottomWidth: 0.5,
    
      },
      dropdownSelected: {
          fontSize: 16,
          borderColor: 'black',
          borderStyle: 'solid',
          borderWidth: 1,
      },

      aboveBoard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
      },

      board: {
          alignSelf: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          width: '100%',
          alignItems: 'center',
          marginBottom: 8,
      },
      cell: {
          borderColor: theme.cellBorder,
          borderStyle: 'solid',
          padding: 0,
          margin: 0,
          borderWidth: 1.4,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
      },
      boxShell: {
          width: boxWidth,
          height: boxWidth,
          borderColor: theme.boxBorder,
          backgroundColor: theme.boxBackground,
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
          backgroundColor: theme.highlightBox,
          borderWidth: 2,
      },
      focus: {
          borderWidth: 2,
          backgroundColor: theme.focus,
      },
      boxWrong: {
          borderColor: 'red',
          color: 'red',
      },
      boxHighlightNum: {
          backgroundColor: theme.focus,
      },

      numbers: {
          flexDirection: 'row',
          justifyContent: 'center',
          width: '100%',
      },
      numberBox: {
          borderWidth: 1,
          borderColor: theme.text,
          paddingHorizontal: 4,
          marginHorizontal: 4,
          marginVertical: 4,
      },
      number: {
          fontSize: 32,
      },
      highlightNumber: {
          fontSize: 32,
          backgroundColor: theme.focus,
      },
      numberQuantity: {
          justifyContent: 'center',
          color: theme.text,
      },
      finishedNumber: {
          borderColor: theme.cellBorder,
          color: theme.cellBorder,
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
          color: theme.focus,
      },

      textColor: {
          color: theme.text,
      },
      outsideText: {
          fontSize: 20,
          color: theme.text,
          verticalAlign: 'middle',
          marginHorizontal: 6
      },
      symbol: {
          verticalAlign: 'middle',
      },

  });
  const icons = {
    Gear: decodeEntity('&#9881;'),
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => {setIsActive(false)}}>
            <Text style={[styles.textColor, styles.headerText]}>{icons.Gear}</Text>
        </Pressable>
        <Text style={[styles.headerText]}>Sudoku </Text>
      </View>
      <View style={styles.aboveBoard}>
        {sudoku !== null ? <Text style={[styles.outsideText]}>Mistakes: {sudoku.mistakes}</Text> : <Text style={[styles.outsideText]}>Mistakes: 0</Text>}
        {difficulty !== null ? <Text style={[styles.outsideText]}>{difficulty.label}</Text> : <Text style={[styles.outsideText]}>{difficulties[0].label}</Text>}
      </View>
      {sudoku !== null && displayBoard()}
      {sudoku == null && displayEmptyBoard()}

      <View style={[styles.row, {justifyContent: 'space-evenly', margin: 8, marginBottom: 16}]}>
          <FontAwesome6 name="pencil" size={32}  color={isTemp ? theme.focus : theme.text } style={styles.symbol} onPress={() => {setIsTemp(!isTemp); setRefresh( refresh + ' ')}}/>
          {!isLock && <AntDesign name="unlock" size={32} color={theme.text} style={styles.symbol} onPress={() => {setIsLock(!isLock); setRefresh(refresh + ' ')}}/>}
          {isLock && <AntDesign name="lock" size={32} color={theme.focus} style={styles.symbol} onPress={() => {setIsLock(!isLock); setRefresh('')}}/>}
          <Fontisto name="save-1" size={32} color={theme.text} style={styles.symbol} onPress={() => {saveState()}}/>
          <Ionicons name="document-text-sharp" size={32} style={styles.symbol} color={theme.text} onPress={() => {loadState()}}/>
      </View>

      {sudoku !== null && displayNumbers()}
      {sudoku == null && displayNumbers(true)}

      <Modal
        animationType="slide"
        transparent={true}
        visible={!isActive}
      >
        <View style={styles.modalView}>
            {finishStats !== null && <View style={{alignSelf: 'center', marginBottom: 16}}>
                <Text style={[styles.textColor, {fontSize: 16, alignSelf: 'center'}]}>Difficulty Completed: {difficulties.find((e) => e.value == finishStats.difficulty).label}</Text>
                <Text style={[styles.textColor, {fontSize: 16, alignSelf: 'center'}]}>Mistakes Made: {finishStats.mistakes}</Text>
            </View>}
            <Text style={[styles.headerText, {marginBottom: 4}]}>Select a difficulty: </Text>
            <Dropdown style={[styles.input, {marginBottom: 8, borderColor: theme.focus, borderWidth: 1, borderRadius: 8, padding: 4}]} containerStyle={{backgroundColor: theme.background, borderRadius: 8, borderWidth: 1, borderColor: theme.cellBorder, color: theme.text}} itemTextStyle={{color: theme.text}} itemContainerStyle={{backgroundColor: theme.highlight, borderRadius: 8}} activeColor={theme.focus} selectedTextStyle={[{color: theme.text, borderRadius: 8, borderColor: theme.text}]} data={difficulties} labelField="label" valueField="value"  value={difficulty} onChange={item => updateDifficulty(item)}/>
            <View style={{marginBottom: 40, alignSelf: 'center'}}>
            {(settings !== null && difficulty !== null) && <Text style={[styles.textColor, {alignSelf: 'center', fontSize: 16}]}> Games Completed: {settings.stats[settings.stats.findIndex((e) => e.difficulty == difficulty.value)].gameQuantity}</Text>}
            {(settings !== null && difficulty !== null) && <Text style={[styles.textColor, {alignSelf: 'center', fontSize: 16}]}> Average Mistakes Made: {settings.stats[settings.stats.findIndex((e) => e.difficulty == difficulty.value)].averageMistakesMade}</Text>}
          </View>
          {(sudoku !== null && sudoku !== '' && finishStats == null) && displayButton('Continue', () => {setIsActive(true); setFinishStats(null)}, {borderRadius: 8})}
          {(difficulty !== null) ? displayButton('New Game', () => {buildBoard(); setIsActive(true); setFinishStats(null)}, {borderRadius: 8}) : displayButton('New Game', () => {setFinishStats(null)}, {borderRadius: 8})}
        </View>
      </Modal>
      
      <StatusBar style="auto" />
    </View>
  );
}