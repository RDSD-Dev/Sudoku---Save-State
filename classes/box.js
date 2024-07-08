import { StyleSheet, Text, View } from 'react-native';

export default class Box{
    constructor(id, cellId,  current, solution){
        this.isFocus;
        this.id = id;
        this.cellId = cellId;
        this.current = current;
        this.solution = solution;
        this.temp = [];
    }

    setCurrent(tempCurrent){

    }
    addTemp(temp){

    }
    removeTemp(temp){

    }

    displayBox(){
        if(this.current == this.solution){ // Display Solution
            return(
                <View style={this.styles.box}>
                    <Text>{this.solution}</Text>
                </View>
            );
        }
        else if(this.current == '-' ){ // Display Current
            return(
                <View style={this.styles.box}>
                    <Text>{this.current}</Text>
                </View>
            );
        }
        else{ // Display Temp
            return(
                <View style={this.styles.box}>
                    <Text>Temp</Text>
                </View>
            );
        }
    }

    styles = StyleSheet.create({
        box: {
            borderColor: 'grey',
            borderWidth: 1,
            borderStyle: 'solid',
            padding: 4,
            margin: 0,
            alignItems: 'center',
            alignSelf: 'center',
        },
    });
}