import {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';

export default function Home() {
    const navigation = useNavigation();
    const [settings, setSettings] = useState(null);
    const [sudoku, setSudoku] = useState(null);
    const difficulties = [
        {label: 'Easy', value: 'easy'},
        {label: 'Medium', value: 'medium'},
        {label: 'Hard', value: 'hard'},
        {label: 'Expert', value: 'expert'},
    ];
    const [difficulty, setDifficulty] = useState(null);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if(sudoku == null){
                AsyncStorage.getItem('sudoku').then((value) => {
                    setSudoku(JSON.parse(value));
                });
            }
          });

        navigation.setOptions({});
        if(settings == null){
            const value = AsyncStorage.getItem('settings').then((value) => {
                if(value == null){ // Make new settings 
                    console.log("Making Settings");
                    const tempSettings = {
                        difficulty: difficulties[0],
                        sudoku: null,
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
    }, [settings, difficulty]);

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

    function navigateSudoku(isContinue){
        if(isContinue){
            navigation.navigate('Sudoku', { difficulty: difficulties.find((e) => e.value == sudoku.difficulty), sudoku: sudoku});
        }
        else{
            setSudoku(null);
            navigation.navigate('Sudoku', {difficulty: difficulty});
        }
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
        },

        input: {
            width: 140,
            margin: 16,
            height: 50,
            color: 'black',
            fontSize: 16,
            borderBottomColor: 'gray',
            borderBottomWidth: 0.5,
      
        },
        dropdownSelected: {
            fontSize: 16,
            borderColor: 'black',
            borderStyle: 'solid',
            borderWidth: 1,
        }
    });

    return (
        <View style={styles.container}>
            
            <Dropdown style={styles.input} selectedTextStyle={styles.dropdownSelected} data={difficulties} labelField="label" valueField="value"  value={difficulty} onChange={item => updateDifficulty(item)}/>
            {sudoku !== null && sudoku !== '' && <Button title='Continue' onPress={() => navigateSudoku(true)}/>}
            <Button title='Sudoku' onPress={() => navigateSudoku(false)}/>

            <StatusBar style="auto" />
        </View>
    );
}

