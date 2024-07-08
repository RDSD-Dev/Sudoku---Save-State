import { StyleSheet, Text, View, Button } from 'react-native';
import Box from './box';

export default class Cell{
    constructor(id, ids, boxes, solutions){
        this.id = id;
        this.boxes = [];
        for(let i=0; i< boxes.length; i++){
            this.boxes.push(new Box(ids[i], boxes[i], solutions[i]));
        }
    }

    displayCell(){
        return(
            <View style={this.styles.cell}>
                <View style={this.styles.row}>
                    {this.boxes[0].displayBox()}
                    {this.boxes[1].displayBox()}
                    {this.boxes[2].displayBox()}
                </View>
                <View style={this.styles.row}>
                    {this.boxes[3].displayBox()}
                    {this.boxes[4].displayBox()}
                    {this.boxes[5].displayBox()}
                </View>
                <View style={this.styles.row}>
                    {this.boxes[6].displayBox()}
                    {this.boxes[7].displayBox()}
                    {this.boxes[8].displayBox()}
                </View>
            </View>
        );
    }

    styles = StyleSheet.create({
        cell: {
            padding: 2,
            width: '30%',
            margin: 0,
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