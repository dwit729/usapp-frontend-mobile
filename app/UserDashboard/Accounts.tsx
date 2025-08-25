import React, { useState, useContext, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image, Dimensions, Modal } from 'react-native';
import ActionButton from '../../components/Buttons/ActionButton';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';


export default function Accounts() {
    const { width, height } = Dimensions.get('window');
    const router = useRouter();
    const [showLeaveModal, setshowLeaveModal] = useState(false);

    const { user, setUser } = useContext(UserContext);
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        userType: 'Guardian',
        age: '',
        endName: '',
        endAge: '',
        boardPreference: '',
        preferredVoice: 0,
        preferredPitch: 0,
        preferredSpeed: 0,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [Loading, setLoading] = useState(false);
    const [Submitting, setSubmitting] = useState(false);

    const getPreferredVoiceLabel = (value: any) => {
        switch (value) {
            case 0: return 'Male';
            case 1: return 'Female';
            case 2: return 'Child';
        }
    }

    const getPreferredPitchLabel = (value: any) => {
        switch (value) {
            case 0: return 'Low';
            case 1: return 'Medium';
            case 2: return 'High';
        }
    }

    const getPreferredSpeedLabel = (value: any) => {
        switch (value) {
            case 0: return 'Slow';
            case 1: return 'Moderate';
            case 2: return 'Fast';
        }
    }
    const fetchUserData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://usapp-backend.vercel.app/api/users/${user.userId}`);
            setUserData({ ...response.data, userId: user.userId });
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {


        fetchUserData();
    }, [user]);

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear().then(() => {
                router.dismiss(2)
                setUser(null);
            });
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const handleSave = async () => {
        // Basic validation
        // Username validation
        if (!userData.username || userData.username.trim().length < 2) {
            alert('Username is required and must be at least 2 characters.');
            return;
        }
        // Email validation
        if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            alert('A valid email address is required.');
            return;
        }
        // Guardian-specific validation
        if (userData.userType === 'Guardian') {
            if (!userData.endName || userData.endName.trim().length < 2) {
                alert('End user name is required and must be at least 2 characters.');
                return;
            }
            if (!userData.endAge || isNaN(Number(userData.endAge)) || Number(userData.endAge) < 5 || Number(userData.endAge) > 120) {
                alert('Invalid end user age. Please enter a valid age between 5 and 120.');
                return;
            }
        }
        setSubmitting(true);
        setIsEditing(false);
        try {
            await axios.post(
                `https://usapp-backend.vercel.app/api/users/${user.userId}/edituser`,
                userData,
                { headers: { 'Content-Type': 'application/json' } }
            );
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <ScrollView>
                    <>
                        {Loading ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff6eb', minHeight: height }}>
                            <Text style={{ textAlign: 'center', fontSize: 18, marginTop: 20 }}>Loading...</Text>
                        </View>
                            :
                            <View style={styles.container}>
                                <Text style={styles.header}>Account Settings</Text>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Username</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: isEditing ? 'white' : '#e0e0e0' }]}
                                        placeholder="Enter your username"
                                        value={userData.username}
                                        onChangeText={text => setUserData(prev => ({ ...prev, username: text }))}
                                        editable={isEditing}
                                    />
                                </View>


                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Board Preference</Text>
                                    <Dropdown
                                        data={[
                                            { label: 'Left', value: 'Left' },
                                            { label: 'Right', value: 'Right' },
                                        ]}
                                        value={userData.boardPreference}
                                        onChange={item => setUserData(prev => ({ ...prev, boardPreference: item.value }))}
                                        placeholder={userData.boardPreference || 'Select'}
                                        disable={!isEditing}
                                        containerStyle={{ width: '100%' }}
                                        labelField="label"
                                        valueField="value"
                                        style={{
                                            backgroundColor: isEditing ? 'white' : '#e0e0e0',
                                            padding: 10,
                                            borderRadius: 5,
                                            borderWidth: 1,
                                            borderColor: '#ccc'
                                        }}
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Preferred Voice</Text>
                                    <Dropdown
                                        data={[
                                            { label: 'Male', value: '0' },
                                            { label: 'Female', value: '1' },

                                        ]}
                                        value={userData.preferredVoice}
                                        onChange={item => setUserData(prev => ({ ...prev, preferredVoice: Number(item.value) }))}
                                        placeholder={getPreferredVoiceLabel(userData.preferredVoice)}
                                        containerStyle={{ width: '100%' }}
                                        labelField="label"
                                        valueField="value"
                                        style={{ backgroundColor: isEditing ? 'white' : '#e0e0e0', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#ccc' }}
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Preferred Pitch</Text>
                                    <Dropdown
                                        data={[
                                            { label: 'Low', value: '0' },
                                            { label: 'Medium', value: '1' },
                                            { label: 'High', value: '2' },
                                        ]}
                                        value={userData.preferredPitch}
                                        onChange={item => setUserData(prev => ({ ...prev, preferredPitch: Number(item.value) }))}
                                        placeholder={getPreferredPitchLabel(userData.preferredPitch)}
                                        disable={!isEditing}
                                        containerStyle={{ width: '100%' }}
                                        labelField="label"
                                        valueField="value"
                                        style={{ backgroundColor: isEditing ? 'white' : '#e0e0e0', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#ccc' }}
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Preferred Voice Speed</Text>
                                    <Dropdown
                                        data={[
                                            { label: 'Slow', value: '0' },
                                            { label: 'Moderate', value: '1' },
                                            { label: 'Fast', value: '2' },
                                        ]}
                                        value={userData.preferredSpeed}
                                        onChange={item => setUserData(prev => ({ ...prev, preferredSpeed: Number(item.value) }))}
                                        placeholder={getPreferredSpeedLabel(userData.preferredSpeed)}
                                        disable={!isEditing}
                                        containerStyle={{ width: '100%' }}
                                        labelField="label"
                                        valueField="value"
                                        style={{ backgroundColor: isEditing ? 'white' : '#e0e0e0', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#ccc' }}
                                    />
                                </View>

                                {
                                    (userData.userType === 'Guardian') && (
                                        <>
                                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>END USER INFO</Text>

                                            <View style={styles.inputContainer}>
                                                <Text style={styles.label}>Name</Text>
                                                <TextInput
                                                    style={[styles.input, { backgroundColor: isEditing ? 'white' : '#e0e0e0' }]}
                                                    placeholder="Enter your name"
                                                    value={userData.endName}
                                                    onChangeText={text => setUserData(prev => ({ ...prev, endName: text }))}
                                                    editable={isEditing}
                                                />
                                            </View>

                                            <View style={styles.inputContainer}>
                                                <Text style={styles.label}>Age</Text>
                                                <TextInput
                                                    style={[styles.input, { backgroundColor: isEditing ? 'white' : '#e0e0e0' }]}
                                                    placeholder="Enter your age"
                                                    value={userData.endAge}
                                                    onChangeText={text => setUserData(prev => ({ ...prev, endAge: text }))}
                                                    keyboardType="numeric"
                                                    editable={isEditing}
                                                />
                                            </View>
                                        </>
                                    )
                                }
                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                                    {!isEditing ? (
                                        <ActionButton
                                            title="Edit"
                                            color="#2196F3"
                                            onPress={() => setIsEditing(true)}
                                            width="100%"
                                        />
                                    ) : (
                                        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, width: '80%' }}>
                                            <ActionButton
                                                title="Cancel"
                                                color="#F44336"
                                                onPress={() => { setIsEditing(false); fetchUserData(); }}
                                                width="50%"
                                            />
                                            <ActionButton
                                                title="Save"
                                                color="#4CAF50"
                                                onPress={handleSave}
                                                width="50%"
                                            />
                                        </View>
                                    )}
                                </View>

                                <View style={{ marginTop: 30, alignItems: 'center' }}>
                                    <ActionButton
                                        title="Logout"
                                        color="#FF9800"
                                        onPress={() => { setshowLeaveModal(true) }}
                                        width="100%"
                                    />
                                </View>

                                <Modal
                                    visible={showLeaveModal}
                                    transparent
                                    animationType="fade"
                                    onRequestClose={() => setshowLeaveModal(false)}
                                >
                                    <View style={styles.modalOverlay}>
                                        <View style={styles.modalContent}>
                                            <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
                                                Are you sure you want to log out?
                                            </Text>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <ActionButton
                                                    title="Cancel"
                                                    color="#2196F3"
                                                    onPress={() => setshowLeaveModal(false)}
                                                    width="45%"
                                                />
                                                <ActionButton
                                                    title="Logout"
                                                    color="#F44336"
                                                    onPress={async () => {
                                                        try {
                                                            handleLogout()
                                                        } catch (error) {

                                                        }


                                                    }}
                                                    width="45%"
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </Modal>

                                {Submitting && (
                                    <View style={styles.modalOverlay}>
                                        <View style={styles.modalContent}>
                                            <Text style={{ textAlign: 'center', fontSize: 18 }}>Saving...</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        }
                    </>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff6eb',
        padding: 16,
        paddingBottom: 32,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 20,
        paddingVertical: 10,
        backgroundColor: '#043b64',
        color: 'white',
        width: '100%',
        textAlign: 'center',

    },
    inputContainer: {
        width: '100%',
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
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        paddingHorizontal: 10,
        alignSelf: 'center'
    }
});
