import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';

const Board_Button = ({ name, color, onSelect }) => {
    const [selected, setSelected] = useState(false);

    const handlePress = () => {
        setSelected(!selected);
        onSelect(name, !selected);
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: color, borderColor: selected ? 'black' : 'transparent' }
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Image resizeMode='center' style={{ height: 50, width: 50 }} source={require('../../assets/logo/placeholder_img.jpg')} />
            <View style={{ backgroundColor: 'white', width: '100%', flexGrow: 1, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, marginTop: 3 }}>
                <Text style={styles.text}>{name}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    text: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'capitalize'
    },
});

export default Board_Button;
