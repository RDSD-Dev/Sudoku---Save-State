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
                <View>
                    <Text>{this.solution}</Text>
                </View>
            );
        }
        else if(this.current == '-' ){ // Display Current
            return(
                <View>
                    <Text>{this.current}</Text>
                </View>
            );
        }
        else{ // Display Temp
            return(
                <View>
                    <Text>Temp</Text>
                </View>
            );
        }
    }

    styles = StyleSheet.create({
        container: {
            borderColor: 'grey',
            borderWidth: 1,
            borderStyle: 'solid',
            padding: 8,
            margin: 8,

            alignItems: 'center',
            justifyContent: 'center',
        },
    });
}