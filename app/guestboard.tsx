import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, FlatList, Dimensions, ActivityIndicator, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { BackHandler } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons, Entypo, FontAwesome6 } from '@expo/vector-icons'
import axios from 'axios'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'

export default function guestboard() {
    const { width, height } = Dimensions.get('window');
    const [AISentence, setAISentence] = useState("");
    const [loading, setLoading] = useState(false); // Loading state
    const [modalVisible, setModalVisible] = useState(false); // Modal visibility state

    const testButtons = [
        // People
        { buttonCategory: "People", buttonImagePath: "images/mama.png", buttonName: "Mama" },
        { buttonCategory: "People", buttonImagePath: "images/papa.png", buttonName: "Papa" },
        { buttonCategory: "People", buttonImagePath: "images/ako.png", buttonName: "Ako" },
        { buttonCategory: "People", buttonImagePath: "images/ikaw.png", buttonName: "Ikaw" },

        // Actions
        { buttonCategory: "Actions", buttonImagePath: "images/kain.png", buttonName: "Kain" },
        { buttonCategory: "Actions", buttonImagePath: "images/inom.png", buttonName: "Inom" },
        { buttonCategory: "Actions", buttonImagePath: "images/tulog.png", buttonName: "Tulog" },
        { buttonCategory: "Actions", buttonImagePath: "images/laro.png", buttonName: "Laro" },

        // Feelings
        { buttonCategory: "Feelings", buttonImagePath: "images/masaya.png", buttonName: "Masaya" },
        { buttonCategory: "Feelings", buttonImagePath: "images/malungkot.png", buttonName: "Malungkot" },
        { buttonCategory: "Feelings", buttonImagePath: "images/galit.png", buttonName: "Galit" },
        { buttonCategory: "Feelings", buttonImagePath: "images/takot.png", buttonName: "Takot" },

        // Things
        { buttonCategory: "Things", buttonImagePath: "images/tubig.png", buttonName: "Tubig" },
        { buttonCategory: "Things", buttonImagePath: "images/gatas.png", buttonName: "Gatas" },
        { buttonCategory: "Things", buttonImagePath: "images/bola.png", buttonName: "Bola" },
        { buttonCategory: "Things", buttonImagePath: "images/laruan.png", buttonName: "Laruan" },

        // Places
        { buttonCategory: "Places", buttonImagePath: "images/bahay.png", buttonName: "Bahay" },
        { buttonCategory: "Places", buttonImagePath: "images/eskwelahan.png", buttonName: "Eskwelahan" },
        { buttonCategory: "Places", buttonImagePath: "images/CR.png", buttonName: "CR" },
        { buttonCategory: "Places", buttonImagePath: "images/labas.png", buttonName: "Labas" }
    ];

    const router = useRouter()
    const [isSwitchOn, setIsSwitchOn] = useState(false)
    const [selectedWords, setSelectedWords] = useState<{ buttonCategory: string; buttonImagePath: string; buttonName: string }[]>([]);
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    const toggleSwitch = () => setIsSwitchOn(!isSwitchOn);

    const activateTextToSpeech = async (text: string) => {
        try {
            const response = await axios.post('https://usapp-backend.vercel.app/api/board/selected', {
                "text": text
            });
            const data = await response.data;
            console.log(response.data); // Base64 encoded audio content

            // Write base64 to a temporary mp3 file
            const uri = FileSystem.cacheDirectory + 'tts.mp3';
            await FileSystem.writeAsStringAsync(uri, data, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const { sound } = await Audio.Sound.createAsync({ uri });
            setSound(sound);
            await sound.playAsync();
        } catch (error) {
            console.error(error);
        }
    }

    const handleBuildSentence = async (text: string) => {
        setLoading(true); // Start loading
        try {
            const response = await axios.post('https://usapp-backend.vercel.app/api/board/buildSentence', {
                "text": text
            });
            const data = await response.data;
            console.log(data);
            setAISentence(data.message);
            activateAISpeech(data.message);
            setModalVisible(true); // Show modal
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false); // Stop loading
        }
    }

    const activateAISpeech = async (text: string) => {
        try {
            const response = await axios.post('https://usapp-backend.vercel.app/api/board/selected', {
                "text": text
            });
            const data = await response.data;
            console.log(response.data); // Base64 encoded audio content

            // Write base64 to a temporary mp3 file
            const uri = FileSystem.cacheDirectory + 'tts.mp3';
            await FileSystem.writeAsStringAsync(uri, data, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const { sound } = await Audio.Sound.createAsync({ uri });
            setSound(sound);
            await sound.playAsync();
        } catch (error) {
            console.error(error);
        }
    }

    const handleBoardButtonPress = (button: { buttonCategory: string; buttonImagePath: string; buttonName: string }) => {
        if (!isSwitchOn) {
            setSelectedWords((prev) => [...prev, button]);
        }
    };

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
            <View style={[styles.row, { maxWidth: "100%" }]}>
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
                    <View style={styles.boardButtons}>
                        {testButtons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.boardButton, { backgroundColor: getCategoryColor(button.buttonCategory) }]}
                                onPress={() => handleBoardButtonPress(button)}
                            >
                                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.boardButtonText}>{button.buttonName}</Text>
                            </TouchableOpacity>
                        ))}
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
                        <Text style={styles.iconText}>TOGGLE</Text>
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
                statusBarTranslucent={true}
                animationType="fade"
                transparent={true}
                visible={loading}
                onRequestClose={() => setLoading(false)}
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
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    leftPanel: {
        flexGrow: 1,
        flex: 1,
        height: "100%",
        maxWidth: "100%",
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
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
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
        height: "100%",
        alignItems: "center",
    },
    boardButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        maxWidth: "100%",
        marginTop: 10,
    },
    boardButton: {
        width: 100,
        height: 100,
        margin: 5,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "flex-end",
        padding: 5,
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
        flex: 1,
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
