import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, FlatList, Dimensions, ActivityIndicator, Modal } from 'react-native'
import React, { useEffect, useState, useContext, useCallback } from 'react'
import { BackHandler } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons, Entypo, FontAwesome6 } from '@expo/vector-icons'
import axios from 'axios'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import { UserContext } from '@/contexts/UserContext'
import { BoardContext } from '@/contexts/BoardContext'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function guestboard() {
    const { user, setUser } = useContext(UserContext);
    const { board, setBoard } = useContext(BoardContext);
    const [UserData, setUserData] = useState<{ boardPreference: string; preferredVoice?: number; preferredPitch?: number }>({ boardPreference: "left" });
    const [CurrentBoard, setCurrentBoard] = useState();
    const [AISentence, setAISentence] = useState("");
    const [loading, setLoading] = useState(false); // Loading state
    const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
    const [buttonSounds, setButtonSounds] = useState<{ [key: string]: string }>({});
    type BoardButton = { buttonCategory: string; buttonImagePath: string; buttonName: string };
    const [testButtons, settestButtons] = useState<BoardButton[]>([]);
    const router = useRouter()
    const [isSwitchOn, setIsSwitchOn] = useState(false)
    const [selectedWords, setSelectedWords] = useState<{ buttonCategory: string; buttonImagePath: string; buttonName: string }[]>([]);
    // Separate loading states
    const [aiLoading, setAiLoading] = useState(false); // For AI sentence building
    const [configLoading, setConfigLoading] = useState(false); // For board/user config
    const [containerWidth, setContainerWidth] = useState(0);




    const onLayout = useCallback((event: { nativeEvent: { layout: { width: number; height: number } } }) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
    }, []);

    const calculateNumColumns = () => {
        if (!containerWidth) return 0;
        return Math.max(1, Math.floor(containerWidth / 100));
    };

    const numColumns = calculateNumColumns();

    // Update effect to use configLoading
    useEffect(() => {


        const fetchUserData = async () => {
            setConfigLoading(true);
            try {
                const response = await axios.get(`https://usapp-backend.vercel.app/api/users/${user.userId}`);
                setUserData({ ...response.data, userId: user.userId });
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {

                fetchBoard();
            }
        };
        const fetchBoard = async () => {
            setConfigLoading(true);
            try {
                const response = await axios.get(`https://usapp-backend.vercel.app/api/users/${user.userId}/${board.id}/getboard`);
                setCurrentBoard(response.data);
                settestButtons(response.data.buttons);
            } catch (error) {
                console.error('Error fetching default buttons:', error);
                Alert.alert('Error', 'Failed to fetch user boards');
            } finally {

            }
        };


        fetchUserData();


    }, [user, board]);

    useEffect(() => {
        const preloadButtonSounds = async () => {
            for (const button of testButtons) {
                try {
                    const response = await axios.post('https://usapp-backend.vercel.app/api/board/selected', {
                        text: button.buttonName,
                        pitch: ((UserData.preferredPitch) ? UserData.preferredPitch : 1),
                        voice: ((UserData.preferredVoice) ? UserData.preferredVoice : 0),
                    });
                    const base64Audio = response.data;
                    const uri = FileSystem.cacheDirectory + `${button.buttonName}_tts.mp3`;
                    await FileSystem.writeAsStringAsync(uri, base64Audio, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    setButtonSounds(prev => ({ ...prev, [button.buttonName]: uri }));
                } catch (error) {
                    console.error(`Failed to preload sound for ${button.buttonName}:`, error);
                }
            }
            setConfigLoading(false);
        };

        preloadButtonSounds()
    }, [testButtons]);

    // Use a single Audio.Sound instance for all button sounds
    const [soundInstance, setSoundInstance] = useState<Audio.Sound | null>(null);

    const playButtonSound = async (buttonName: string) => {
        try {
            const uri = buttonSounds[buttonName];
            if (uri) {

                const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
                await sound.playAsync();
            } else {
                Alert.alert("Sound not loaded", "Please try again later.");
            }
        } catch (error) {
            console.error(`Error playing sound for ${buttonName}:`, error);
        }
    };

    // Update AI loading in handleBuildSentence
    const handleBuildSentence = async (text: string) => {
        setAiLoading(true); // Start AI loading
        try {
            const response = await axios.post('https://usapp-backend.vercel.app/api/board/buildSentence', {
                "text": text
            });
            const data = await response.data;

            setAISentence(data.message);
            activateAISpeech(data.message);
            setModalVisible(true); // Show modal
        } catch (error) {
            console.error(error);
        } finally {
            setAiLoading(false); // Stop AI loading
        }
    }



    const toggleSwitch = () => setIsSwitchOn(!isSwitchOn);

    const activateTextToSpeech = async (text: string) => {
        try {
            const response = await axios.post('https://usapp-backend.vercel.app/api/board/selected', {
                "text": text,
                pitch: ((UserData.preferredPitch) ? UserData.preferredPitch : 1),
                voice: ((UserData.preferredVoice) ? UserData.preferredVoice : 0),
            });
            const data = await response.data;


            // Write base64 to a temporary mp3 file
            const uri = FileSystem.cacheDirectory + 'tts.mp3';
            await FileSystem.writeAsStringAsync(uri, data, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const { sound } = await Audio.Sound.createAsync({ uri });
            await sound.playAsync();
        } catch (error) {
            console.error(error);
        }
    }



    // Update handleBoardButtonPress to play sound
    const handleBoardButtonPress = (button: { buttonCategory: string; buttonImagePath: string; buttonName: string }) => {
        if (isSwitchOn) {
            playButtonSound(button.buttonName);
        }
        else {
            setSelectedWords((prev) => [...prev, button]);
        }
    }

    const activateAISpeech = async (text: string) => {
        try {
            const response = await axios.post('https://usapp-backend.vercel.app/api/board/selected', {
                "text": text,
                pitch: ((UserData.preferredPitch) ? UserData.preferredPitch : 1),
                voice: ((UserData.preferredVoice) ? UserData.preferredVoice : 0),
            });
            const data = await response.data;


            // Write base64 to a temporary mp3 file
            const uri = FileSystem.cacheDirectory + 'tts.mp3';
            await FileSystem.writeAsStringAsync(uri, data, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const { sound } = await Audio.Sound.createAsync({ uri });
            await sound.playAsync();
        } catch (error) {
            console.error(error);
        }
    }

    const handleDeleteWord = (index: number) => {
        setSelectedWords((prev) => prev.filter((_, i) => i !== index));
    };

    const handleClearAll = () => {
        Alert.alert('Clear All', 'Are you sure you want to clear all selected words?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes', onPress: () => setSelectedWords([]) },
        ]);
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "People": return "#FFD700";
            case "Actions": return "#FF4500";
            case "Feelings": return "#32CD32";
            case "Things": return "#1E90FF";
            case "Places": return "#8A2BE2";
            default: return "#ccc";
        }
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            Alert.alert('Hold on!', 'Are you sure you want to exit the app?', [
                { text: 'Cancel', style: 'cancel', onPress: () => null },
                {
                    text: 'YES', onPress: () => {
                        router.dismiss()
                    }
                },
            ]);
            return true;
        });

        return () => backHandler.remove();
    }, []);

    return (
        <View style={styles.container}>
            <View style={[styles.row, { maxWidth: "100%", flexDirection: (UserData.boardPreference === "right") ? "row" : "row-reverse" }]}>
                <View style={styles.leftPanel}>
                    <View style={styles.topright}>
                        <View style={styles.collection}>
                            <FlatList

                                data={selectedWords}
                                keyExtractor={(_, index) => index.toString()}
                                horizontal
                                renderItem={({ item, index }) => (
                                    <View style={styles.selectedWord}>
                                        <Text style={{}}>{(item as { buttonName: string }).buttonName}</Text>
                                        <TouchableOpacity onPress={() => handleDeleteWord(index)}>
                                            <FontAwesome6 name="delete-left" size={20} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        </View>
                        <TouchableOpacity style={styles.clearbutton} onPress={handleClearAll}>
                            <MaterialCommunityIcons name='delete' size={32} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.boardButtons} onLayout={onLayout}>
                        <SafeAreaProvider>
                            <SafeAreaView>
                                {(containerWidth > 0) ? (
                                    <FlatList
                                        key={numColumns}
                                        style={{ width: "100%", height: "100%" }}
                                        data={testButtons}
                                        keyExtractor={(_, index) => index.toString()}
                                        numColumns={numColumns}
                                        pagingEnabled
                                        showsVerticalScrollIndicator={true}
                                        scrollEnabled={true}
                                        renderItem={({ item: button, index }) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[styles.boardButton, { backgroundColor: getCategoryColor(button.buttonCategory) }]}
                                                onPress={() => handleBoardButtonPress(button)}
                                            >
                                                <View style={styles.boardImage} />
                                                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.boardButtonText}>{button.buttonName}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                ) : (
                                    <ActivityIndicator size="large" color="#000" />
                                )}
                            </SafeAreaView>
                        </SafeAreaProvider>

                    </View>
                </View>
                <View style={styles.rightPanel}>
                    <Text style={styles.panelHeader}>CONTROLS</Text>
                    <TouchableOpacity style={styles.iconButton} onPress={() => {
                        if (selectedWords.length > 0) {
                            const textToSpeak = selectedWords.map(word => word.buttonName).join(' ');
                            activateTextToSpeech(textToSpeak);
                        } else {
                            Alert.alert("No words selected", "Please select words to speak.");
                        }
                    }}>
                        <MaterialCommunityIcons name='text-to-speech' size={32} color="#fff" />
                        <Text style={styles.iconText}>TALK</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => {
                        if (selectedWords.length > 0) {
                            const textToSpeak = selectedWords.map(word => word.buttonName).join(' ');
                            handleBuildSentence(textToSpeak);
                        } else {
                            Alert.alert("No words selected", "Please select words to speak.");
                        }
                    }}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#fff" />
                        ) : (
                            <>
                                <Entypo name="network" size={32} color="#fff" />
                                <Text style={styles.iconText}>AI</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <View style={styles.iconButton}>
                        <Switch
                            trackColor={{ false: "#767577", true: "#81b0ff" }}
                            thumbColor={isSwitchOn ? "#f5dd4b" : "#f4f3f4"}
                            value={isSwitchOn}
                            onValueChange={toggleSwitch}
                            style={styles.switch}
                        />
                        <Text style={[styles.iconText, { marginTop: 5 }]}>AUTO-SPEAK</Text>
                    </View>
                </View>
            </View>

            {/* Modal for AISentence */}
            <Modal
                statusBarTranslucent={true}
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>{AISentence}</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                statusBarTranslucent={false}
                animationType="fade"
                transparent={true}
                visible={configLoading}
                onRequestClose={() => setConfigLoading(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>CONFIGURING BOARD</Text>
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                </View>
            </Modal>
            <Modal
                statusBarTranslucent={true}
                animationType="fade"
                transparent={true}
                visible={aiLoading}
                onRequestClose={() => setAiLoading(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>BUILDING SENTENCE...</Text>
                        <ActivityIndicator size={'large'} color="#000" />
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "flex-start",
        alignItems: "center",
        height: "100%",
        width: "100%",
        gap: "2%",
    },
    row: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",

    },
    leftPanel: {
        flexGrow: 1,
        height: "100%",
        maxHeight: '100%',
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#fff6eb",
        padding: 10,


    },
    rightPanel: {
        minWidth: 150,
        height: "100%",
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#BEE6EA",
        padding: 10,
    },
    panelHeader: {
        fontSize: 20,
        fontWeight: '900',
        color: "#043b64",
        marginBottom: 20,
    },
    iconButton: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#065a96",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        width: "90%",
        height: "auto",
        minHeight: 80,
    },
    iconText: {
        color: "#fff",
        fontSize: 16,
        width: "100%",
        textAlign: "center",
        fontWeight: "bold",
    },
    switch: {
        transform: "[rotate(-90deg), scale(1.5)]",
        marginVertical: 10,
    },
    topright: {
        width: "100%",
        flexDirection: "row",
    },
    collection: {
        flexGrow: 1,
        height: 60,
        justifyContent: "flex-start",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
        flexDirection: "row",
        padding: 5,
        overflow: "hidden",
    },
    clearbutton: {
        backgroundColor: "#fe8917",
        padding: 10,
        borderRadius: 10,
        marginLeft: 10,
        width: 60,

    },
    boardButtons: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        maxWidth: "100%",
        width: "100%",
        marginTop: 10,
        maxHeight: "100%",

    },
    boardButton: {
        width: 100,
        height: 120,
        margin: 5,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "flex-end",
        padding: 5,
        gap: 5,
    },
    boardImage: {
        backgroundColor: "#fff",
        width: "100%",
        flexGrow: 1,
        borderTopRightRadius: 6,
        borderTopLeftRadius: 6,
    },

    boardButtonText: {
        color: "black",
        fontWeight: "bold",
        textAlign: "center",
        textTransform: "capitalize",
        backgroundColor: "white",
        width: "100%",
        borderRadius: 4,
        fontSize: 20,
    },
    selectedWord: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 10,
        backgroundColor: "#f0f0f0",
        padding: 5,
        borderRadius: 5,
        gap: 5,
        borderWidth: 1,
        width: "auto"
    },
    modalContainer: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "50%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },
    modalText: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: "#065a96",
        padding: 10,
        borderRadius: 5,
    },
    modalButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});
