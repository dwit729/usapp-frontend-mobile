import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, FlatList, Dimensions, ActivityIndicator, Modal, ScrollView, Image } from 'react-native'
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
        {
            "id": "zNvdtMERokNkqpincFbp",
            "buttonName": "Ako",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756108968120_ako.png?alt=media&token=229b742d-c308-4176-84b5-9d394933a072",
            "buttonCategory": "Pronouns",
            "buttonImageRef": "default/photos/1756108968120_ako.png",
            "source": "DefaultButtons"
        },
        {
            "id": "RwZBi9C1lBV8ABbpy4uq",
            "buttonName": "Ikaw",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756109398596_ikaw.png?alt=media&token=3d980937-7e71-4b6c-985a-af95621e1aad",
            "buttonCategory": "Pronouns",
            "buttonImageRef": "default/photos/1756109398596_ikaw.png",
            "source": "DefaultButtons"
        },
        {
            "id": "xPiwUBM5eGlCKfGxKr7y",
            "buttonName": "Kami",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756112627881_kami.png?alt=media&token=2d4c02ce-b9cf-4e93-9751-8b9cb67c3a5c",
            "buttonCategory": "Pronouns",
            "buttonImageRef": "default/photos/1756112627881_kami.png",
            "source": "DefaultButtons"
        },
        {
            "id": "gulxVOgTblzNPHVLJ0tN",
            "buttonName": "Tayo",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756109764236_tayo.png?alt=media&token=de683e1f-27eb-4d64-9742-aa52b976640c",
            "buttonCategory": "Pronouns",
            "buttonImageRef": "default/photos/1756109764236_tayo.png",
            "source": "DefaultButtons"
        },
        {
            "id": "mMAEuztaHPJbPpPILjwZ",
            "buttonName": "Sila",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756112655317_sila.png?alt=media&token=4c28f83a-b893-45f5-b93d-69034c071bd2",
            "buttonCategory": "Pronouns",
            "buttonImageRef": "default/photos/1756112655317_sila.png",
            "source": "DefaultButtons"
        },
        {
            "id": "1WUjZxpS0ujXivdZHUZZ",
            "buttonName": "Gawa",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756116549649_gawa.svg?alt=media&token=1e565cba-a623-4bac-8490-d774c894bce4",
            "buttonCategory": "Verbs",
            "buttonImageRef": "default/photos/1756116549649_gawa.svg",
            "source": "DefaultButtons"
        },
        {
            "id": "0BfaSJfV8ofegWXJtoye",
            "buttonName": "Punta",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756116522349_punta.png?alt=media&token=bbf03d2a-822f-46e3-aff9-0f135df364a9",
            "buttonCategory": "Verbs",
            "buttonImageRef": "default/photos/1756116522349_punta.png",
            "source": "DefaultButtons"
        },
        {
            "id": "62KZmpRl9AozxaWFqtIs",
            "buttonName": "Gusto",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756116399061_what.png?alt=media&token=b5a46363-c83c-41bd-81c2-3781b4c6a205",
            "buttonCategory": "Verbs",
            "buttonImageRef": "default/photos/1756116399061_what.png",
            "source": "DefaultButtons"
        },
        {
            "id": "CiUxwG54FBFD65tb6IU2",
            "buttonName": "Tingin",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756116607463_tingin.png?alt=media&token=a14b5ece-d50c-473f-978a-6e5c217ac7a9",
            "buttonCategory": "Verbs",
            "buttonImageRef": "default/photos/1756116607463_tingin.png",
            "source": "DefaultButtons"
        },
        {
            "id": "I8877NKz03WO29ODBxFT",
            "buttonName": "Bigay",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756116574111_bigay.svg?alt=media&token=7500dcb3-277d-46d4-ad19-339318e3dd00",
            "buttonCategory": "Verbs",
            "buttonImageRef": "default/photos/1756116574111_bigay.svg",
            "source": "DefaultButtons"
        },
        {
            "id": "JzirfqBezp6BrPbhUl5P",
            "buttonName": "Salita",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756116631795_salita.svg?alt=media&token=3d1a5a66-6aa4-43ab-8646-3bcd8af4b590",
            "buttonCategory": "Verbs",
            "buttonImageRef": "default/photos/1756116631795_salita.svg",
            "source": "DefaultButtons"
        },
        {
            "id": "NemP2oVC1C7LTsBvMaJw",
            "buttonName": "Tulog",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756116506789_tulog.svg?alt=media&token=40ed5156-81d4-4fbf-b49a-2062c4d0bba8",
            "buttonCategory": "Verbs",
            "buttonImageRef": "default/photos/1756116506789_tulog.svg",
            "source": "DefaultButtons"
        },
        {
            "id": "Grec9bVjuv1ELUAkAmT0",
            "buttonName": "Mama",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756114825803_nanay.png?alt=media&token=53829c14-4fe4-4fbe-936b-264e6f6ba043",
            "buttonCategory": "Nouns",
            "buttonImageRef": "default/photos/1756114825803_nanay.png",
            "source": "DefaultButtons"
        },
        {
            "id": "QybpsqPyWAUcQ5CZ1DmO",
            "buttonName": "Papa",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756114916459_father.png?alt=media&token=bb9cfad5-140c-4b7c-9b6c-b82c62b92ccd",
            "buttonCategory": "Nouns",
            "buttonImageRef": "default/photos/1756114916459_father.png",
            "source": "DefaultButtons"
        },
        {
            "id": "Fic8Pxv22j3UWpQgklOU",
            "buttonName": "Nanay",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756114817511_nanay.png?alt=media&token=0d7d6a13-aa2d-4250-8f7c-ad684a0d2626",
            "buttonCategory": "Nouns",
            "buttonImageRef": "default/photos/1756114817511_nanay.png",
            "source": "DefaultButtons"
        },
        {
            "id": "cZd9IacHAE9Twt86nXo7",
            "buttonName": "Kapatid",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756114763441_kapatid.png?alt=media&token=6a37ed29-fdc1-4dfa-b87d-e233fd2c3eea",
            "buttonCategory": "Nouns",
            "buttonImageRef": "default/photos/1756114763441_kapatid.png",
            "source": "DefaultButtons"
        },
        {
            "id": "pqe4MkyEjLAN0rSer7sY",
            "buttonName": "Lolo",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756114901833_lolo.png?alt=media&token=bb42bb75-745b-4b2c-9aff-938be7fc6598",
            "buttonCategory": "Nouns",
            "buttonImageRef": "default/photos/1756114901833_lolo.png",
            "source": "DefaultButtons"
        },
        {
            "id": "pHF45TEQyPJdp7VmZcdi",
            "buttonName": "Lola",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756114954946_lola.png?alt=media&token=6b3e9a5b-a652-4037-921e-56e24f836769",
            "buttonCategory": "Nouns",
            "buttonImageRef": "default/photos/1756114954946_lola.png",
            "source": "DefaultButtons"
        },
        {
            "id": "uH0zgnxsP2vOIW6xhMTl",
            "buttonName": "Ano",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756114104934_what.png?alt=media&token=96eab5ca-e113-4cd8-bc8b-c5c5b0ea2e07",
            "buttonCategory": "Questions",
            "buttonImageRef": "default/photos/1756114104934_what.png",
            "source": "DefaultButtons"
        },
        {
            "id": "q24VSUQMPrqY6ZXgyga8",
            "buttonName": "Bakit",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756116130642_bakit.png?alt=media&token=409d7b0e-a8f4-4d1d-9852-dc4856f1ecc5",
            "buttonCategory": "Questions",
            "buttonImageRef": "default/photos/1756116130642_bakit.png",
            "source": "DefaultButtons"
        },
        {
            "id": "qMpqvDkRaAepOzeeqAn8",
            "buttonName": "Saan",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756109710595_Where.svg?alt=media&token=7f993488-40e7-47ef-952a-f36012bbe7d7",
            "buttonCategory": "Questions",
            "buttonImageRef": "default/photos/1756109710595_Where.svg",
            "source": "DefaultButtons"
        },
        {
            "id": "nyFp5juD39dgy6JjauL2",
            "buttonName": "Paano",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756116154685_paano.png?alt=media&token=a7d48164-7b08-4ded-8397-7f1abc8d8f54",
            "buttonCategory": "Questions",
            "buttonImageRef": "default/photos/1756116154685_paano.png",
            "source": "DefaultButtons"
        },
        {
            "id": "3gtOG6Z9bGylv9kCMemx",
            "buttonName": "Kailan",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756115986651_Kailan.png?alt=media&token=3ac18fc8-3798-4315-ad25-5f08e6ec2cb0",
            "buttonCategory": "Questions",
            "buttonImageRef": "default/photos/1756115986651_Kailan.png",
            "source": "DefaultButtons"
        },
        {
            "id": "iI8qnp7uZShwKTtsTL5n",
            "buttonName": "Kain",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756116436173_eat.png?alt=media&token=8cb0453c-0b58-44c7-bea5-388328d25d68",
            "buttonCategory": "Verbs",
            "buttonImageRef": "default/photos/1756116436173_eat.png",
            "source": "DefaultButtons"
        },
        {
            "id": "ePHtX7SfsxjHXClIlHFE",
            "buttonName": "Inom",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756116466351_inom.png?alt=media&token=bb9850b3-a895-4234-a651-77b6b5265656",
            "buttonCategory": "Verbs",
            "buttonImageRef": "default/photos/1756116466351_inom.png",
            "source": "DefaultButtons"
        },
        {
            "id": "Wz8tdcNRi1gV3qrMG7Ds",
            "buttonName": "Laro",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756116487213_laro.png?alt=media&token=a6b05743-d624-412d-8eaf-126bc630e941",
            "buttonCategory": "Verbs",
            "buttonImageRef": "default/photos/1756116487213_laro.png",
            "source": "DefaultButtons"
        },
        {
            "id": "UWGDpWp5w9fD0XX8HFpG",
            "buttonName": "Oo",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756116176195_oo.png?alt=media&token=e012f90e-b995-4852-9729-65a8d613da42",
            "buttonCategory": "Negation & Important Words",
            "buttonImageRef": "default/photos/1756116176195_oo.png",
            "source": "DefaultButtons"
        },
        {
            "id": "pufNOW7smsMtHvVCstzs",
            "buttonName": "Hindi",
            "buttonImagePath": "https://firebasestorage.googleapis.com/v0/b/usapp-b776a.firebasestorage.app/o/default%2Fphotos%2F1756116197163_no.png?alt=media&token=ee976587-f1f1-4725-8e80-20c4940ba476",
            "buttonCategory": "Negation & Important Words",
            "buttonImageRef": "default/photos/1756116197163_no.png",
            "source": "DefaultButtons"
        }
    ]



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
                                        showsVerticalScrollIndicator={true}
                                        scrollEnabled={true}
                                        renderItem={({ item: button, index }) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[styles.boardButton, { backgroundColor: getCategoryColor(button.buttonCategory), height: height / 4.5 }]}
                                                onPress={() => handleBoardButtonPress(button)}
                                            >
                                                <Image source={{ uri: button.buttonImagePath }} style={styles.boardImage} resizeMode="contain" />
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