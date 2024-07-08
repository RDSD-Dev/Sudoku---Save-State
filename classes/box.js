import { StyleSheet, Text, View, Button } from 'react-native';

export default class Box{
    constructor(id, current, solution){
        this.id = id;
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
            width: '30%',
            alignItems: 'center',
            alignSelf: 'center',
        },
    });
}