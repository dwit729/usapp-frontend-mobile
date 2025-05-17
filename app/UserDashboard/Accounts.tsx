import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import ActionButton from '../../components/Buttons/ActionButton';

export default function Accounts() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [preferredVoice, setPreferredVoice] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        setIsEditing(false);
        console.log({
            username,
            password,
            preferredVoice,
            name,
            age,
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image resizeMode='cover' style={{ height: 100, width: '100%', marginBottom: 20 }} source={require('../../assets/backgrounds/header_background_img.png')} />
            <Text style={styles.header}>Account Settings</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: isEditing ? 'white' : '#e0e0e0' }]}
                    placeholder="Enter your username"
                    value={username}
                    onChangeText={setUsername}
                    editable={isEditing}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Reset Password</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: isEditing ? 'white' : '#e0e0e0' }]}
                    placeholder="Enter new password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    editable={isEditing}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Preferred Voice</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: isEditing ? 'white' : '#e0e0e0' }]}
                    placeholder="Enter preferred voice"
                    value={preferredVoice}
                    onChangeText={setPreferredVoice}
                    editable={isEditing}
                />
            </View>

            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>END USER INFO</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: isEditing ? 'white' : '#e0e0e0' }]}
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={setName}
                    editable={isEditing}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: isEditing ? 'white' : '#e0e0e0' }]}
                    placeholder="Enter your age"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    editable={isEditing}
                />
            </View>

            {isEditing ? (
                <View style={{ flexDirection: 'row', }}>
                    <ActionButton
                        title="Cancel"
                        color="#4CAF50"
                        onPress={() => { setIsEditing(false) }}
                    />
                    <ActionButton
                        title="Save Changes"
                        color="#4CAF50"
                        onPress={handleSave}
                    />
                </View>
            ) : (
                <ActionButton
                    title="Edit"
                    color="#2196F3"
                    width='50%'
                    onPress={() => setIsEditing(true)}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#fff6eb',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    inputContainer: {
        width: '80%',
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        alignSelf: 'center'
    },
});