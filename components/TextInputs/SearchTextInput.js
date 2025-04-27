import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';  // Requires Expo or react-native-vector-icons

const SearchTextInput = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <View style={styles.container}>
            <Ionicons name="search" size={20} color="gray" style={styles.icon} />
            <TextInput
                style={styles.input}
                placeholder="Search..."
                value={query}
                onChangeText={(text) => {
                    setQuery(text);
                    onSearch(text);
                }}
            />
            {query.length > 0 && (
                <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color="gray" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 30,
        marginVertical: 10,
    },
    icon: {
        marginRight: 5,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 5,
    },
    clearButton: {
        marginLeft: 5,
    },
});

export default SearchBar;
