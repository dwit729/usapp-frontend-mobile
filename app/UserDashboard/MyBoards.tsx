import { View, Text, Image, Alert, TouchableOpacity, Dimensions, ScrollView, TextInput, StyleSheet, BackHandler, Modal } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown';
import React, { useContext, useState, useEffect, useCallback } from 'react'
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import { router, useFocusEffect } from 'expo-router';
import { BoardContext } from '../../contexts/BoardContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MyBoards() {
    const { user, setUser } = useContext(UserContext);
    const { board, setBoard } = useContext(BoardContext);
    const [UserBoard, setUserBoard] = useState();
    const [UserBoards, setUserBoards] = useState<{ id: string; boardName: string; boardCategory: string; category?: string }[]>([]);
    const [Loading, setLoading] = useState(false);
    const [UserData, setUserData] = useState();
    const [DisplayName, setDisplayName] = useState();
    const { width, height } = Dimensions.get('window');
    const [reload, setreload] = useState(false);
    const [Deleting, setDeleting] = useState(false);

    const [searchText, setSearchText] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const filteredBoards = UserBoards.filter(board =>
        (selectedCategory === 'All' || board.boardCategory === selectedCategory) &&
        board.boardName.toLowerCase().includes(searchText.toLowerCase())
    );

    const getCategoryColor = (category: any) => {
        switch (category) {
            case 'Paaralan': return '#FACC15'; // yellow-400
            case 'Bahay': return '#EF4444'; // red-500
            case 'Pagkain': return '#22C55E'; // green-500
            case 'Kalusugan': return '#3B82F6'; // blue-500
            case 'Pamilya': return '#8B5CF6'; // purple-500
            case 'Pang-araw-araw na Gawain': return '#FB923C'; // orange-400
            case 'Sarili': return '#A3E635'; // lime-400
            case 'Laro at Libangan': return '#F472B6'; // pink-400
            case 'Panahon at Kalikasan': return '#38BDF8'; // sky-400
            default: return '#D1D5DB'; // gray-300
        }
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {

            Alert.alert('Hold on!', 'Are you sure you want to exit the app?', [
                { text: 'Cancel', style: 'cancel', onPress: () => null },
                {
                    text: 'YES', onPress: () => {

                        router.dismiss(2)
                    }
                },
            ]);
            return true;
        });

        return () => backHandler.remove();
    }, []);



    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`https://usapp-backend.vercel.app/api/users/${user.userId}`);
                setUserData({ ...response.data, userId: user.userId });
                setDisplayName((response.data.userType === 'Guardian' ? response.data.endname : response.data.username) || 'User');
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);


    const goToBoard = () => {
        console.log("board", board);
        router.push({ pathname: '/UserBoard/Board' });
    }



    useFocusEffect(
        useCallback(() => {
            const fetchDefaultButtons = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`https://usapp-backend.vercel.app/api/users/${user.userId}/userboards`);
                    setUserBoards(response.data); // Assuming the response contains an array of buttons
                    console.log(response.data);
                } catch (error) {
                    console.error('Error fetching default buttons:', error);
                    Alert.alert('Error', 'Failed to fetch user boards');
                } finally {
                    setLoading(false);
                }
            };

            fetchDefaultButtons();
        }, [user, reload])
    );

    return (
        <>
            {Loading && (
                <View style={styles.loadingOverlay}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.mainContainer}>
                    <Text adjustsFontSizeToFit style={styles.title}>{DisplayName}'s Boards</Text>

                    {/* Search Bar */}
                    <View style={styles.searchBarContainer}>
                        <View style={styles.searchBar}>
                            <Text style={styles.searchIcon}>🔍</Text>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search boards..."
                                value={searchText}
                                onChangeText={setSearchText}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Filter by Category using Dropdown */}
                    <View style={styles.dropdownContainer}>
                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownSelectedText}
                            data={[
                                { label: 'All', value: 'All' },
                                { label: 'Paaralan', value: 'Paaralan' },
                                { label: 'Bahay', value: 'Bahay' },
                                { label: 'Pagkain', value: 'Pagkain' },
                                { label: 'Kalusugan', value: 'Kalusugan' },
                                { label: 'Pamilya', value: 'Pamilya' },
                                { label: 'Pang-araw-araw na Gawain', value: 'Pang-araw-araw na Gawain' },
                                { label: 'Sarili', value: 'Sarili' },
                                { label: 'Laro at Libangan', value: 'Laro at Libangan' },
                                { label: 'Panahon at Kalikasan', value: 'Panahon at Kalikasan' }
                            ]}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Category"
                            value={selectedCategory}
                            onChange={item => setSelectedCategory(item.value)}
                        />
                    </View>

                    <View style={styles.boardsContainer}>
                        {
                            filteredBoards.map((board, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.boardTouchable}
                                    onPress={async () => {
                                        await setBoard(board);
                                        goToBoard();
                                    }}
                                    onLongPress={() => {
                                        Alert.alert(
                                            'Delete Board',
                                            `Are you sure you want to delete "${board.boardName}"?`,
                                            [
                                                { text: 'Cancel', style: 'cancel' },
                                                {
                                                    text: 'Delete',
                                                    style: 'destructive',
                                                    onPress: async () => {
                                                        try {
                                                            setDeleting(true);
                                                            console.log(board.id);
                                                            await axios.post(`https://usapp-backend.vercel.app/api/users/${user.userId}/${board.id}/deleteboard`)

                                                        } catch (error) {
                                                            Alert.alert('Success', 'Board deleted successfully');
                                                            setreload(prev => !prev); // trigger reload to refetch boards
                                                        }
                                                        finally {
                                                            setDeleting(false);
                                                        }
                                                    }
                                                }
                                            ]
                                        );
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.boardCard,
                                            { backgroundColor: getCategoryColor(board.boardCategory) }
                                        ]}
                                    >
                                        <View style={styles.boardImage} />
                                        <Text adjustsFontSizeToFit numberOfLines={1} style={styles.boardName}>{board.boardName}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                    <Modal visible={Deleting} transparent animationType="fade">
                        <View style={{
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <View style={{
                                backgroundColor: '#fff',
                                padding: 32,
                                borderRadius: 12,
                                alignItems: 'center',
                                elevation: 10
                            }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Deleting...</Text>
                                <Text style={{ fontSize: 16, color: '#555' }}>Please wait while the board is being deleted.</Text>
                            </View>
                        </View>
                    </Modal>
                </View>
            </ScrollView>
        </>
    )
}
const styles = StyleSheet.create({
    loadingOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#fff6eb',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    loadingText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333'
    },
    scrollContainer: {
        justifyContent: "flex-start",
        alignItems: "center",
        minHeight: Dimensions.get('window').height,
        backgroundColor: "#fff6eb"
    },
    mainContainer: {
        width: '80%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 20
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#000",
        width: '100%',
        backgroundColor: "white",
        textAlign: "center",
        paddingVertical: 2,
        borderWidth: 1.5,
        borderStyle: 'dashed'
    },
    searchBarContainer: {
        width: '100%',
        marginTop: 20,
        marginBottom: 10
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 10,
        height: 40
    },
    searchIcon: {
        marginRight: 8,
        color: '#888'
    },
    searchInput: {
        flex: 1,
        fontSize: 16
    },
    dropdownContainer: {
        width: '100%',
        marginBottom: 16
    },
    dropdown: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    dropdownPlaceholder: {
        color: '#888',
        fontSize: 16
    },
    dropdownSelectedText: {
        color: '#222',
        fontSize: 16
    },
    boardsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        minHeight: Dimensions.get('window').height * .7,
        width: '100%',
        marginTop: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5
    },
    boardTouchable: {},
    boardCard: {
        width: 100,
        height: 100,
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 4,
    },
    boardImage: {
        width: '100%',
        height: '50%',
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 8,
    },
    boardName: {
        color: 'black',
        fontWeight: '600',
        fontSize: 18,
        backgroundColor: 'white',
        width: '100%',
        textAlign: 'center',
        borderRadius: 2,
        paddingHorizontal: 2,
        flexGrow: 1,
        textAlignVertical: 'center'
    }
});
