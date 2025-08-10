import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import ActionButton from '../../components/Buttons/ActionButton';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';

export default function Accounts() {
    const { user } = useContext(UserContext);
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        userType: 'Guardian',
        age: '',
        endName: '',
        endAge: '',
        boardPreference: 0,
        preferredVoice: 0,
        preferredPitch: 0,
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

    useEffect(() => {
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

        fetchUserData();
    }, [user]);

    const handleSave = async () => {
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
        <>
            {Loading ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff6eb' }}>
                <Text style={{ textAlign: 'center', fontSize: 18, marginTop: 20 }}>Loading...</Text>
            </View>
                :
                <ScrollView contentContainerStyle={styles.container}>
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

                    {/* Reset Password Button and Modal */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Reset Password</Text>
                        <ActionButton
                            title="Reset Password"
                            color="#FF9800"
                            onPress={() => setShowPasswordModal(true)}
                            disabled={!isEditing}
                        />
                    </View>
                    {/* Password Reset Modal */}
                    {showPasswordModal && (
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.label}>Enter New Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="New password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={true}
                                />
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                    <ActionButton
                                        title="Cancel"
                                        color="#888"
                                        onPress={() => setShowPasswordModal(false)}
                                    />
                                    <ActionButton
                                        title="Save"
                                        color="#4CAF50"
                                        onPress={() => {
                                            setShowPasswordModal(false);
                                            // Optionally handle password save here
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    )}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Board Preference</Text>
                        <Dropdown
                            data={[
                                { label: 'Left', value: 'Left' },
                                { label: 'Right', value: 'Right' },
                            ]}
                            value={userData.boardPreference}
                            onChange={item => setUserData(prev => ({ ...prev, boardPreference: Number(item.value) }))}
                            placeholder={userData.boardPreference === 1 ? 'Right' : 'Left'}
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
                        <Text style={styles.label}>Preferred Voice: {userData.preferredVoice}</Text>
                        <Dropdown
                            data={[
                                { label: 'Male', value: '0' },
                                { label: 'Female', value: '1' },
                                { label: 'Child', value: '2' },
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
                                    onPress={() => setIsEditing(false)}
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

                    {Submitting && (
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={{ textAlign: 'center', fontSize: 18 }}>Saving...</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>
            }
        </>
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
