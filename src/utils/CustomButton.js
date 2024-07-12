import * as React from 'react';
import {StyleSheet, Text, TouchableOpacity} from "react-native";
import {BUTTON_BLUE, BUTTON_PADDING, DEFAULT_FONT_SIZE} from "../variables/Variables";


const CustomButton = ({title, onPress, absolute}) => {

    return (
        <TouchableOpacity
            style={[styles.submitButton, absolute ? {position: "absolute", bottom: 15, right: 10} : null]}
            onPress={onPress}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    submitButton: {
        padding: BUTTON_PADDING,
        backgroundColor: BUTTON_BLUE,
        borderRadius: 3,
    },
    buttonText: {
        color: "white",
        fontSize: DEFAULT_FONT_SIZE,
        fontWeight: '600',
    },
});

export default CustomButton;
