import { StyleSheet, View, Pressable } from 'react-native';
import { getSudoku } from 'sudoku-gen';
import Cell from './cell';
import Box from './box';

export default class Board{
    constructor(difficulty, boardStr){
        if(boardStr == undefined){ // Generate new board
            this.focus = null;
            const tempSudoku = getSudoku(difficulty);
            this.puzzleStr = tempSudoku.puzzle;
            this.solutionStr = tempSudoku.solution;
            let celArr = [[], [], [], [], [], [], [], [], []];
            let solArr = [[], [], [], [], [], [], [], [], []];
            let currentCell = 0;
            for(let i=0; i< tempSudoku.puzzle.length; i++){
                const currentPuzzle = tempSudoku.puzzle[i];
                const currentSolution = tempSudoku.solution[i];
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
                celArr[currentCell].push(currentPuzzle);
                solArr[currentCell].push(currentSolution);
            }
            this.cells = [];
            for(let i=0; i<9; i++){
                this.cells.push(new Cell(i, celArr[i], solArr[i]));
            }
        }
        else{ // Remake old board

        }
    }

    setFocus(cellId, boxId){
        console.log("Focus: ", cellId, " Box: ", boxId);
        this.focus = [cellId, boxId];
    }

    displayCell(cell){
        return(
            <View style={this.styles.cell}>
                <View style={this.styles.row}>
                    <Pressable onPress={() => this.setFocus(cell.id, cell.boxes[0].id)}>
                        {cell.boxes[0].displayBox()}
                    </Pressable>
                    <Pressable onPress={() => this.setFocus(cell.id, cell.boxes[1].id)}>
                        {cell.boxes[1].displayBox()}
                    </Pressable>
                    <Pressable onPress={() => this.setFocus(cell.id, cell.boxes[2].id)}>
                        {cell.boxes[2].displayBox()}
                    </Pressable>
                </View>
                <View style={this.styles.row}>
                    <Pressable onPress={() => this.setFocus(cell.id, cell.boxes[3].id)}>
                        {cell.boxes[3].displayBox()}
                    </Pressable>
                    <Pressable onPress={() => this.setFocus(cell.id, cell.boxes[4].id)}>
                        {cell.boxes[4].displayBox()}
                    </Pressable>
                    <Pressable onPress={() => this.setFocus(cell.id, cell.boxes[5].id)}>
                        {cell.boxes[5].displayBox()}
                    </Pressable>
                </View>
                <View style={this.styles.row}>
                    <Pressable onPress={() => this.setFocus(cell.id, cell.boxes[6].id)}>
                        {cell.boxes[6].displayBox()}
                    </Pressable>
                    <Pressable onPress={() => this.setFocus(cell.id, cell.boxes[7].id)}>
                        {cell.boxes[7].displayBox()}
                    </Pressable>
                    <Pressable onPress={() => this.setFocus(cell.id, cell.boxes[8].id)}>
                        {cell.boxes[8].displayBox()}
                    </Pressable>
                </View>
            </View>
        );
    }

    displayBoard(){
        return(
            <View style={this.styles.board}>
                <View style={this.styles.row}>
                    {this.displayCell(this.cells[0])}
                    {this.displayCell(this.cells[1])}
                    {this.displayCell(this.cells[2])}
                </View>
                <View style={this.styles.row}>
                    {this.displayCell(this.cells[3])}
                    {this.displayCell(this.cells[4])}
                    {this.displayCell(this.cells[5])}
                </View>
                <View style={this.styles.row}>
                    {this.displayCell(this.cells[6])}
                    {this.displayCell(this.cells[7])}
                    {this.displayCell(this.cells[8])}
                </View>
            </View>
        );
    }

    styles = StyleSheet.create({
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
        
        row: {
            flexDirection: 'row',
        }

    });

}