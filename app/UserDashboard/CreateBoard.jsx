import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';
import { Dropdown } from 'react-native-element-dropdown';

export default function CreateBoard() {
    const [boardName, setBoardName] = useState('');
    const [boardCategory, setBoardCategory] = useState('');
    const [selectedButtons, setSelectedButtons] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [testButtons, setTestButtons] = useState([]);
    const { user, setUser } = useContext(UserContext);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const boardCategoryOptions = [
        { label: 'Paaralan', value: 'Paaralan' },
        { label: 'Bahay', value: 'Bahay' },
        { label: 'Pagkain', value: 'Pagkain' },
        { label: 'Kalusugan', value: 'Kalusugan' },
        { label: 'Pamilya', value: 'Pamilya' },
        { label: 'Pang-araw-araw na Gawain', value: 'Pang-araw-araw na Gawain' },
        { label: 'Sarili', value: 'Sarili' },
        { label: 'Laro at Libangan', value: 'Laro at Libangan' },
        { label: 'Panahon at Kalikasan', value: 'Panahon at Kalikasan' }
    ];

    useEffect(() => {
        if (!user || !user.userId) return;

        const fetchDefaultButtons = async () => {
            setLoading(true);
            try {
                const response = await axios.get('https://usapp-backend.vercel.app/api/default/buttonsall');
                setTestButtons(response.data.buttons); // Assuming the response contains an array of buttons
            } catch (error) {

                Alert.alert('Error', 'Failed to fetch default buttons.');
            } finally {
                setLoading(false);
            }
        };


        const fetchUserData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`https://usapp-backend.vercel.app/api/users/${user.userId}`);
                setUserData({ ...response.data, userId: user.userId });
            } catch (error) {

            } finally {
                setLoading(false);
            }
        };
        fetchDefaultButtons();
        fetchUserData();

    }, [user]);

    const handleSelectButton = (button) => {
        const isSelected = selectedButtons.find(b => b.id === button.id);
        if (isSelected) {
            setSelectedButtons(prev => prev.filter(b => b.id !== button.id));
        } else {
            setSelectedButtons(prev => [...prev, button]);
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'People': return '#FACC15'; // yellow-400
            case 'Actions': return '#EF4444'; // red-500
            case 'Feelings': return '#22C55E'; // green-500
            case 'Things': return '#3B82F6'; // blue-500
            case 'Places': return '#8B5CF6'; // purple-500
            default: return '#D1D5DB'; // gray-300
        }
    };

    const handleSubmit = async () => {
        if (!boardName || !boardCategory || selectedButtons.length === 0) {
            Alert.alert('Incomplete', 'Please complete all fields and select at least one button.');
            return;
        }

        const buttonIds = selectedButtons.map(button => button.id);

        setSubmitting(true);
        try {
            const response = await axios.post(`https://usapp-backend.vercel.app/api/users/${userData.userId}/boards`, {
                boardName,
                isFavorite: false,
                buttonIds,
            });


            Alert.alert('Success', 'Board created successfully!');
            setBoardName('');
            setBoardCategory('');
            setSelectedButtons([]);
        } catch (error) {

            Alert.alert('Error', 'Failed to create board.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredButtons = testButtons.filter(button =>
        button.buttonName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#305a7a" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }
    if (!user || !user.userId || !userData) {
        return (
            <>
                <View>
                    Loading User..
                </View>
            </>
        )
    }
    return (

        <ScrollView style={styles.container}>
            {submitting && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles.loadingOverlayText}>Submitting...</Text>
                </View>
            )}

            <View style={styles.header}>
                <Text style={styles.headerText}>Create New Board</Text>
            </View>

            <View style={styles.formSection}>
                <Text style={styles.label}>Board Name</Text>
                <TextInput
                    style={{
                        height: 50,
                        width: "100%",
                        marginBottom: 10,
                        padding: 10,
                        borderWidth: 1,
                        borderBottomWidth: 4,
                        borderRightWidth: 4,
                        borderColor: 'black',
                        borderRadius: 6,
                        backgroundColor: '#fff',
                    }}
                    placeholder="Enter board name"
                    value={boardName}
                    onChangeText={setBoardName}
                />

                <Text style={styles.label}>Board Category</Text>

                <Dropdown
                    data={boardCategoryOptions}
                    labelField="label"
                    valueField="value"
                    placeholder="Select User Type"
                    value={boardCategory}
                    onChange={item => setBoardCategory(item.value)}
                    style={{
                        height: 50,
                        width: "100%",
                        marginBottom: 10,
                        padding: 10,
                        borderWidth: 1,
                        borderBottomWidth: 4,
                        borderRightWidth: 4,
                        borderColor: 'black',
                        borderRadius: 6,
                        backgroundColor: '#fff',
                    }}
                    placeholderStyle={{ color: '#aaa' }}
                    selectedTextStyle={{ color: '#000' }}
                />

            </View>

            <View style={styles.selectedSection}>
                <Text style={styles.subHeader}>Selected Buttons</Text>
                <View style={styles.selectedButtons}>
                    {selectedButtons.map((button) => (
                        <View
                            key={button.id}
                            style={[styles.buttonBox, { backgroundColor: getCategoryColor(button.buttonCategory) }]}
                        >
                            <Text style={styles.buttonText}>{button.buttonName}</Text>
                        </View>
                    ))}
                </View>

                {selectedButtons.length > 0 && (
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert('Clear All', 'Are you sure you want to clear all selected buttons?', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Yes', onPress: () => setSelectedButtons([]) }
                            ]);
                        }}
                        style={styles.clearButton}
                    >
                        <Text style={styles.clearButtonText}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View>
                <Text style={styles.subHeader}>Select Buttons</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Search buttons..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <View style={{
                    height: 300, borderRadius: 8,
                    borderWidth: 2,
                    backgroundColor: 'white',
                }}>
                    <ScrollView contentContainerStyle={styles.buttonsContainer} nestedScrollEnabled={true}>
                        {filteredButtons.map((button) => {
                            const isSelected = selectedButtons.some(b => b.id === button.id);
                            return (
                                <TouchableOpacity
                                    key={button.id}
                                    onPress={() => handleSelectButton(button)}
                                    style={[
                                        styles.buttonWrapper,
                                        { backgroundColor: getCategoryColor(button.buttonCategory) },
                                        isSelected && styles.selectedButton
                                    ]}
                                >
                                    <View style={styles.imagePlaceholder} />
                                    <Text style={styles.buttonLabel}>{button.buttonName}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>

            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Create Board</Text>
            </TouchableOpacity>
        </ScrollView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff6eb',
        padding: 16,
        paddingBottom: 32,
    },
    header: {
        backgroundColor: '#305a7a',
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    formSection: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        borderWidth: 2,
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '600',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
    },
    subHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E3A8A',
        marginBottom: 8,
    },
    selectedSection: {
        marginBottom: 16,
    },
    selectedButtons: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: 'black',
        padding: 8,
        borderRadius: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    buttonBox: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    buttonText: {
        fontWeight: 'bold',
        color: 'black',
        fontSize: 18
    },
    clearButton: {
        backgroundColor: '#EF4444',
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: 'black',
    },
    clearButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    buttonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'space-between',
        marginTop: 8,
        paddingBottom: 20,
        width: '100%',
        paddingHorizontal: 10,
    },
    buttonWrapper: {
        width: 120,
        height: 120,
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 4,
    },
    selectedButton: {
        borderWidth: 3,
        borderColor: 'black',
    },
    imagePlaceholder: {
        width: '100%',
        height: '70%',
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 8,
    },
    buttonLabel: {
        color: 'black',
        fontWeight: '600',
        fontSize: 20,
        backgroundColor: 'white',
        width: '100%',
        textAlign: 'center',
        borderRadius: 4
    },
    submitButton: {
        backgroundColor: '#1E3A8A',
        padding: 16,
        marginTop: 24,
        borderRadius: 8,
        marginBottom: 32,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff6eb',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 18,
        color: '#305a7a',
        fontWeight: 'bold',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    loadingOverlayText: {
        marginTop: 16,
        fontSize: 18,
        color: '#ffffff',
        fontWeight: 'bold',
    },
});
