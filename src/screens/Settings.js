import { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native"
// import { Switch } from 'react-native-paper';

export default function Settings() {
    const [isSwitchOn, setIsSwitchOn] = useState(false);

    return(
        <View style={{flex: 1}}>
            <View style={styles.view}>
                <Text>Notifications</Text>
                <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
                <Switch value={isSwitchOn} onValueChange={() => setIsSwitchOn(prev => !prev)}/>
            </View>
            <View style={styles.view}>
                <Text>Save image taken on app to gallery</Text>
                <Switch value={isSwitchOn} onValueChange={() => setIsSwitchOn(prev => !prev)}/>
            </View>
            <View style={styles.view}>
                <Text>Show resolved issues</Text>
                <Switch value={isSwitchOn} onValueChange={() => setIsSwitchOn(prev => !prev)}/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    view: {
        flexDirection: "row",
        // backgroundColor: "blue",
        justifyContent: "space-between",
        alignItems: "center"
    }
})