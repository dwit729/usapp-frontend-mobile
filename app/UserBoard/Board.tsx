import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, FlatList, Dimensions, ActivityIndicator, Modal, ScrollView, Image } from 'react-native'
import * as NavigationBar from 'expo-navigation-bar'
import React, { useEffect, useState, useContext, useCallback } from 'react'
import { BackHandler } from 'react-native'
import { MaterialCommunityIcons, Entypo, FontAwesome6 } from '@expo/vector-icons'
import axios from 'axios'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import { UserContext } from '@/contexts/UserContext'
import { BoardContext } from '@/contexts/BoardContext'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import * as Progress from 'react-native-progress';

// Extend globalThis to include __boardPageOpenedAt
declare global {
    // eslint-disable-next-line no-var
    var __boardPageOpenedAt: number | undefined;
}



export default function guestboard({ navigation }: { navigation: any }) {
    const { width, height } = Dimensions.get('window');
    const { user, setUser } = useContext(UserContext);
    const { board, setBoard } = useContext(BoardContext);
    const [boardName, setboardName] = useState('');
    const [UserData, setUserData] = useState<{ boardPreference: string; preferredVoice?: number; preferredPitch?: number; preferredSpeed?: number }>({ boardPreference: "left" });
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
    const [PressTally, setPressTally] = useState<Record<string, number>>({});
    const [currentEmotion, setcurrentEmotion] = useState("Masaya");
    const [showEmotionModal, setshowEmotionModal] = useState(false);
    const [ProgressData, setProgressData] = useState(0);



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
                setboardName(response.data.boardName);
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
                        speed: ((UserData.preferredSpeed) ? UserData.preferredSpeed : 1),
                    });
                    const base64Audio = response.data;
                    const uri = FileSystem.cacheDirectory + `${button.buttonName}_tts.mp3`;
                    await FileSystem.writeAsStringAsync(uri, base64Audio, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    setButtonSounds(prev => ({ ...prev, [button.buttonName]: uri }));
                    setProgressData((prev) => prev + (100 / testButtons.length));
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
                "text": text,
                "emotion": currentEmotion, // Use currentEmotion state
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
                pitch: ((UserData.preferredPitch) ? UserData.preferredPitch : 3),
                voice: ((UserData.preferredVoice) ? UserData.preferredVoice : 0),
                speed: ((UserData.preferredSpeed) ? UserData.preferredSpeed : 1),
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
        setPressTally((prev) => ({
            ...prev,
            [button.buttonName]: (prev[button.buttonName] || 0) + 1,
        }));
        console.log(PressTally)
        if (isSwitchOn) {
            playButtonSound(button.buttonName);
        }
        else {
            setSelectedWords((prev) => [...prev, button]);
        }
        console.log(PressTally)

    }

    const activateAISpeech = async (text: string) => {
        try {
            const response = await axios.post('https://usapp-backend.vercel.app/api/board/selected', {
                "text": text,
                pitch: ((UserData.preferredPitch) ? UserData.preferredPitch : 1),
                voice: ((UserData.preferredVoice) ? UserData.preferredVoice : 0),
                emotion: currentEmotion,
                speed: ((UserData.preferredSpeed) ? UserData.preferredSpeed : 1),
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
            case 'Nouns': return '#FFA332'; // orange
            case 'Pronouns': return '#FFE777'; // light yellow
            case 'Verbs': return '#A3E264'; // light green
            case 'Adjectives': return '#63C4FF'; // sky blue
            case 'Prepositions & Social Words': return '#FF84C1'; // light pink
            case 'Questions': return '#B28BFF'; // lavender
            case 'Negation & Important Words': return '#FF4747'; // bright red
            case 'Adverbs': return '#B98A6A'; // brown/tan
            case 'Conjunctions': return '#FFFFFF'; // white
            case 'Determiners': return '#595959'; // dark gray
            default: return '#D3D3D3'; // fallback light gray
        }
    };

    /**
     * Logs screen time for the current user.
     * @param duration Time spent in milliseconds
     * @param activityType Type of activity (e.g., "Board", "Settings")
     * @param timestamp Optional ISO timestamp
     */
    const logScreenTime = async (
        duration: number,
        activityType: string,
        timestamp?: string
    ) => {
        if (!user?.userId || !duration || !activityType) return;
        try {
            await axios.post(
                `https://usapp-backend.vercel.app/api/users/${user.userId}/log-screen-time`,
                {
                    duration,
                    activityType,
                    timestamp: timestamp || new Date().toISOString(),
                }
            );
        } catch (err) {
            console.error("Failed to log screen time:", err);
        }
    };

    /**
     * Logs board usage for the current user and board.
     * @param boardId The board's ID
     * @param buttonPresses Object mapping buttonId to press count
     */
    const logBoardUsage = async (
        boardId: string,
        buttonPresses: Record<string, number>
    ) => {
        if (!user?.userId || !boardId) return;
        try {
            await axios.post(
                `https://usapp-backend.vercel.app/api/users/${user.userId}/${boardId}/log-board-usage`,
                { buttonPresses }
            );
        } catch (err) {
            console.error("Failed to log board usage:", err);
        }
    };

    const pressTallyRef = React.useRef(PressTally);
    useEffect(() => {
        pressTallyRef.current = PressTally;
    }, [PressTally]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            logBoardUsage(board.id, pressTallyRef.current); // Use ref here
            console.log("Board usage logged:", pressTallyRef.current); // Use ref here
            Alert.alert('Hold on!', 'Are you sure you want to exit the app?', [
                { text: 'Cancel', style: 'cancel', onPress: () => null },
                {
                    text: 'YES', onPress: () => {
                        // Log screen time before exiting
                        const duration = Date.now() - (globalThis.__boardPageOpenedAt || Date.now());
                        logScreenTime(duration, "Board", new Date().toISOString());

                        router.dismiss()
                    }
                },
            ]);
            return true;
        });

        return () => backHandler.remove();
    }, []);

    return (
        <>
            <SafeAreaProvider style={{ flex: 1, backgroundColor: "#fff6eb" }}   >
                <SafeAreaView style={{ minHeight: height, flex: 1, display: "flex", justifyContent: 'center', alignItems: 'center', backgroundColor: "#fff6eb", paddingHorizontal: 10 }}>
                    <Modal
                        statusBarTranslucent={false}
                        animationType="fade"
                        transparent={true}
                        visible={configLoading}
                        onRequestClose={() => { router.back() }}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalText}>CONFIGURING BOARD</Text>
                                <Progress.Bar
                                    progress={ProgressData / 100}
                                    width={200}
                                    color="#065a96"
                                    borderRadius={5}
                                    borderWidth={2}
                                    height={15}
                                    style={{ marginTop: 20 }}
                                />
                            </View>
                        </View>
                    </Modal>
                    {configLoading ? null : (
                        <View style={[styles.container, { minHeight: height, backgroundColor: "#fff6eb" }]}>
                            <Stack.Screen options={{
                                title: `${boardName}`,
                                headerLeft: () => null,
                                headerTitleAlign: "center",
                                headerTintColor: "#ffffff",
                                headerBackVisible: false,
                            }} />
                            <View style={[styles.row, { flexDirection: (UserData.boardPreference.toLowerCase() === "left") ? "row-reverse" : "row" }]}>
                                <View style={styles.leftPanel}>
                                    <View style={styles.topright}>
                                        <View style={styles.collection}>
                                            <SafeAreaProvider>
                                                <SafeAreaView>
                                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                        {selectedWords.map((item, index) => (
                                                            <View key={index} style={styles.selectedWord}>
                                                                <Text>{item.buttonName}</Text>
                                                                <TouchableOpacity onPress={() => handleDeleteWord(index)}>
                                                                    <FontAwesome6 name="delete-left" size={25} color="red" />
                                                                </TouchableOpacity>
                                                            </View>
                                                        ))}
                                                    </ScrollView>
                                                </SafeAreaView>
                                            </SafeAreaProvider>
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
                                                        showsVerticalScrollIndicator={true}
                                                        persistentScrollbar={true}
                                                        scrollEnabled={true}
                                                        renderItem={({ item: button, index }) => (
                                                            <TouchableOpacity
                                                                key={index}
                                                                style={[styles.boardButton, { backgroundColor: getCategoryColor(button.buttonCategory), height: height / 4.5 }]}
                                                                onPress={() => handleBoardButtonPress(button)}
                                                            >
                                                                {button.buttonImagePath ? (
                                                                    <Image
                                                                        source={{ uri: button.buttonImagePath }}
                                                                        style={styles.boardImage}
                                                                        resizeMode="cover"
                                                                    />
                                                                ) : (
                                                                    <View style={styles.boardImage} />
                                                                )}
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

                                    <SafeAreaProvider>
                                        <SafeAreaView>
                                            <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'flex-start' }}>
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
                                                    <Text adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.iconText, { marginTop: 5 }]}>AUTO-SPEAK</Text>
                                                </View>
                                                <TouchableOpacity style={[styles.iconButton, { marginBottom: 40 }]} onPress={() => setshowEmotionModal(true)}>
                                                    {currentEmotion === "patanong" && (
                                                        <MaterialCommunityIcons name="help-circle-outline" size={32} color="#fff" />
                                                    )}
                                                    {currentEmotion === "masaya" && (
                                                        <MaterialCommunityIcons name="emoticon-happy-outline" size={32} color="#fff" />
                                                    )}
                                                    {currentEmotion === "malungkot" && (
                                                        <MaterialCommunityIcons name="emoticon-sad-outline" size={32} color="#fff" />
                                                    )}
                                                    {currentEmotion === "galit" && (
                                                        <MaterialCommunityIcons name="emoticon-angry-outline" size={32} color="#fff" />
                                                    )}
                                                    {currentEmotion === "malumanay" && (
                                                        <MaterialCommunityIcons name="emoticon-neutral-outline" size={32} color="#fff" />
                                                    )}
                                                    {(currentEmotion === "" || !["patanong", "masaya", "malungkot", "galit", "malumanay"].includes(currentEmotion)) && (
                                                        <MaterialCommunityIcons name="emoticon-outline" size={32} color="#fff" />
                                                    )}
                                                    <Text style={styles.iconText}>{currentEmotion}</Text>
                                                </TouchableOpacity>
                                            </ScrollView>
                                        </SafeAreaView>
                                    </SafeAreaProvider>
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
                            <Modal
                                statusBarTranslucent={true}
                                animationType="fade"
                                transparent={true}
                                visible={showEmotionModal}
                                onRequestClose={() => setshowEmotionModal(false)}
                            >
                                <View style={styles.modalContainer}>
                                    <View style={styles.modalContent}>
                                        <Text style={styles.modalText}>Select Emotion</Text>
                                        {["patanong", "masaya", "malungkot", "galit", "malumanay"].map((emotion) => (
                                            <TouchableOpacity
                                                key={emotion}
                                                style={[
                                                    styles.modalButton,
                                                    { marginVertical: 5, backgroundColor: currentEmotion === emotion ? "#fe8917" : "#065a96" }
                                                ]}
                                                onPress={() => setcurrentEmotion(emotion)}
                                            >
                                                <Text style={styles.modalButtonText}>
                                                    {emotion === "" ? "None" : emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                        <TouchableOpacity
                                            style={[styles.modalButton, { marginTop: 10, backgroundColor: "#888" }]}
                                            onPress={() => setshowEmotionModal(false)}
                                        >
                                            <Text style={styles.modalButtonText}>Close</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>
                            <TouchableOpacity
                                style={[styles.iconButton, { backgroundColor: "#fe8917" }]}
                                onPress={() => setcurrentEmotion(currentEmotion ? "" : "open")}
                            >
                                <MaterialCommunityIcons name="emoticon" size={32} color="#fff" />
                                <Text style={styles.iconText}>
                                    {currentEmotion && currentEmotion !== "open"
                                        ? `Emotion: ${currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1)}`
                                        : "Set Emotion"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </SafeAreaView>
            </SafeAreaProvider>
        </>
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
        paddingHorizontal: 10,
        paddingTop: 10,


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
        marginTop: 10,
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
        paddingBottom: 5

    },
    boardButton: {
        minWidth: 100,
        maxWidth: 150,
        maxHeight: 150,
        minHeight: 100,
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