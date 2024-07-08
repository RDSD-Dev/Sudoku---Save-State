import { StyleSheet, Text, View, Pressable } from 'react-native';
import Box from './box';

export default class Cell{
    constructor(id, boxes, solutions){
        this.id = id;
        this.boxes = [];
        for(let i=0; i< boxes.length; i++){
            this.boxes.push(new Box(i, this.id,  boxes[i], solutions[i]));
        }
    }
}