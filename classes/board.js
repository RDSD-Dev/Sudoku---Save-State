import { StyleSheet, Text, View, Button } from 'react-native';
import { getSudoku } from 'sudoku-gen';
import Cell from './cell';
import Box from './box';

export default class Board{
    constructor(difficulty, boardStr){
        if(boardStr == undefined){ // Generate new board
            const tempSudoku = getSudoku(difficulty);
            this.puzzleStr = tempSudoku.puzzle;
            this.solutionStr = tempSudoku.solution;
            let celArr = [[], [], [], [], [], [], [], [], []];
            let solArr = [[], [], [], [], [], [], [], [], []];
            let idArr = [[], [], [], [], [], [], [], [], []];
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
                idArr[currentCell].push(i);
            }
            this.cells = [];
            for(let i=0; i<9; i++){
                this.cells.push(new Cell(i,idArr[i], celArr[i], solArr[i]));
            }
        }
        else{ // Remake old board

        }
    }

    displayBoard(){
        return(
            <View style={this.styles.board}>
                <View style={this.styles.row}>
                    {this.cells[0].displayCell()}
                    {this.cells[1].displayCell()}
                    {this.cells[2].displayCell()}
                </View>
                <View style={this.styles.row}>
                    {this.cells[3].displayCell()}
                    {this.cells[4].displayCell()}
                    {this.cells[5].displayCell()}
                </View>
                <View style={this.styles.row}>
                    {this.cells[6].displayCell()}
                    {this.cells[7].displayCell()}
                    {this.cells[8].displayCell()}
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
        row: {
            flexDirection: 'row',
        }

    });

}