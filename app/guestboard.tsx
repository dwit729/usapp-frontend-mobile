import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, FlatList, Dimensions, ActivityIndicator, Modal, ScrollView } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { BackHandler } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons, Entypo, FontAwesome6 } from '@expo/vector-icons'
import axios from 'axios'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import * as Progress from 'react-native-progress';

export default function guestboard() {
    const { width, height } = Dimensions.get('window');
    const [AISentence, setAISentence] = useState("");
    const [loading, setLoading] = useState(false); // Loading state
    const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
    const [containerWidth, setContainerWidth] = useState(0);
    const [buttonSounds, setButtonSounds] = useState<{ [key: string]: string }>({});
    const [configLoading, setConfigLoading] = useState(true);
    const [ProgressData, setProgressData] = useState(0);
    useEffect(() => {
        const preloadButtonSounds = async () => {
            setConfigLoading(true);
            for (const button of testButtons) {
                try {
                    const response = await axios.post('https://usapp-backend.vercel.app/api/board/selected', {
                        text: button.buttonName
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
    }, []);

    const onLayout = useCallback((event: { nativeEvent: { layout: { width: number; height: number } } }) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
    }, []);

    const calculateNumColumns = () => {
        if (!containerWidth) return 0;
        return Math.max(1, Math.floor(containerWidth / 100));
    };

    const numColumns = calculateNumColumns();

    const testButtons = [
        // Nouns (Orange)
        { buttonCategory: "Nouns", buttonImagePath: "images/bola.png", buttonName: "Bola" },
        { buttonCategory: "Nouns", buttonImagePath: "images/laruan.png", buttonName: "Laruan" },
        { buttonCategory: "Nouns", buttonImagePath: "images/sapatos.png", buttonName: "Sapatos" },
        { buttonCategory: "Nouns", buttonImagePath: "images/kutsara.png", buttonName: "Kutsara" },

        // Pronouns (Light Yellow)
        { buttonCategory: "Pronouns", buttonImagePath: "images/ako.png", buttonName: "Ako" },
        { buttonCategory: "Pronouns", buttonImagePath: "images/ikaw.png", buttonName: "Ikaw" },
        { buttonCategory: "Pronouns", buttonImagePath: "images/siya.png", buttonName: "Siya" },
        { buttonCategory: "Pronouns", buttonImagePath: "images/tayo.png", buttonName: "Tayo" },

        // Verbs (Light Green)
        { buttonCategory: "Verbs", buttonImagePath: "images/kain.png", buttonName: "Kumain" },
        { buttonCategory: "Verbs", buttonImagePath: "images/inom.png", buttonName: "Uminom" },
        { buttonCategory: "Verbs", buttonImagePath: "images/laro.png", buttonName: "Maglaro" },
        { buttonCategory: "Verbs", buttonImagePath: "images/tulog.png", buttonName: "Matulog" },

        // Adjectives (Sky Blue)
        { buttonCategory: "Adjectives", buttonImagePath: "images/malaki.png", buttonName: "Malaki" },
        { buttonCategory: "Adjectives", buttonImagePath: "images/maliit.png", buttonName: "Maliit" },
        { buttonCategory: "Adjectives", buttonImagePath: "images/mainit.png", buttonName: "Mainit" },
        { buttonCategory: "Adjectives", buttonImagePath: "images/malamig.png", buttonName: "Malamig" },

        // Prepositions & Social Words (Pink)
        { buttonCategory: "Prepositions & Social Words", buttonImagePath: "images/sa_loob.png", buttonName: "Sa Loob" },
        { buttonCategory: "Prepositions & Social Words", buttonImagePath: "images/sa_labas.png", buttonName: "Sa Labas" },
        { buttonCategory: "Prepositions & Social Words", buttonImagePath: "images/salamat.png", buttonName: "Salamat" },
        { buttonCategory: "Prepositions & Social Words", buttonImagePath: "images/paalam.png", buttonName: "Paalam" },

        // Questions (Lavender)
        { buttonCategory: "Questions", buttonImagePath: "images/ano.png", buttonName: "Ano" },
        { buttonCategory: "Questions", buttonImagePath: "images/saan.png", buttonName: "Saan" },
        { buttonCategory: "Questions", buttonImagePath: "images/kailan.png", buttonName: "Kailan" },
        { buttonCategory: "Questions", buttonImagePath: "images/bakit.png", buttonName: "Bakit" },

        // Negation & Important Words (Red)
        { buttonCategory: "Negation & Important Words", buttonImagePath: "images/hindi.png", buttonName: "Hindi" },
        { buttonCategory: "Negation & Important Words", buttonImagePath: "images/ayaw.png", buttonName: "Ayaw" },
        { buttonCategory: "Negation & Important Words", buttonImagePath: "images/sige.png", buttonName: "Sige" },
        { buttonCategory: "Negation & Important Words", buttonImagePath: "images/gusto.png", buttonName: "Gusto" },

        // Adverbs (Brown/Tan)
        { buttonCategory: "Adverbs", buttonImagePath: "images/ngayon.png", buttonName: "Ngayon" },
        { buttonCategory: "Adverbs", buttonImagePath: "images/kanina.png", buttonName: "Kanina" },
        { buttonCategory: "Adverbs", buttonImagePath: "images/mabilis.png", buttonName: "Mabilis" },
        { buttonCategory: "Adverbs", buttonImagePath: "images/dahan_dahan.png", buttonName: "Dahan-dahan" },

        // Conjunctions (White)
        { buttonCategory: "Conjunctions", buttonImagePath: "images/at.png", buttonName: "At" },
        { buttonCategory: "Conjunctions", buttonImagePath: "images/o.png", buttonName: "O" },
        { buttonCategory: "Conjunctions", buttonImagePath: "images/kasi.png", buttonName: "Kasi" },
        { buttonCategory: "Conjunctions", buttonImagePath: "images/pero.png", buttonName: "Pero" },

        // Determiners (Dark Gray)
        { buttonCategory: "Determiners", buttonImagePath: "images/ang.png", buttonName: "Ang" },
        { buttonCategory: "Determiners", buttonImagePath: "images/isang.png", buttonName: "Isang" },
        { buttonCategory: "Determiners", buttonImagePath: "images/lahat.png", buttonName: "Lahat" },
        { buttonCategory: "Determiners", buttonImagePath: "images/wala.png", buttonName: "Wala" },
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
                "text": text,
                "pitch": 1
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
        if (isSwitchOn) {
            playButtonSound(button.buttonName);
        }
        else {
            setSelectedWords((prev) => [...prev, button]);
        }
    }
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

    const handleDeleteWord = (index: number) => {
        setSelectedWords((prev) => prev.filter((_, i) => i !== index));
    };

    const handleClearAll = () => {
        Alert.alert('Clear All', 'Are you sure you want to clear all selected words?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes', onPress: () => setSelectedWords([]) },
        ]);
    };

    const getCategoryColor = (category: any) => {
        switch (category) {
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
                            <SafeAreaProvider>
                                <SafeAreaView>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ alignItems: 'center', paddingVertical: 5 }}>
                                        {selectedWords.map((word, index) => (
                                            <TouchableOpacity key={index} style={styles.selectedWord} onPress={() => handleDeleteWord(index)}>
                                                <FontAwesome6 name="xmark" size={16} color="red" />
                                                <Text style={{ fontSize: 16 }}>{word.buttonName}</Text>
                                            </TouchableOpacity>
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
                                        pagingEnabled
                                        showsVerticalScrollIndicator={true}
                                        scrollEnabled={true}
                                        renderItem={({ item: button, index }) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[styles.boardButton, { backgroundColor: getCategoryColor(button.buttonCategory), height: height / 4.5 }]}
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
                    <SafeAreaProvider>
                        <SafeAreaView>
                            <ScrollView>
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
                                    <Text style={styles.iconText}>AUTO SPEAK</Text>
                                </View>
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
                statusBarTranslucent={false}
                animationType="fade"
                transparent={true}
                visible={configLoading}
                onRequestClose={() => { }}
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
        maxWidth: 140,
        maxHeight: 140,
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