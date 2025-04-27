import { StyleSheet } from 'react-native';

const textInputStyles = StyleSheet.create({
    retroTextInput: {
        borderWidth: 1,
        borderColor: '#000', // Default border color
        borderBottomWidth: 4, // Thicker bottom border
        borderRightWidth: 4, // Thicker bottom-right border
        padding: 10,
        fontSize: 16,
        backgroundColor: '#f4f4f4', // Light retro background
        color: '#333', // Text color
        fontFamily: 'Courier', // Retro font style
        borderRadius: 10, // Rounded borders,
        width: '80%', // Width of the text input
    },
});

export default textInputStyles;