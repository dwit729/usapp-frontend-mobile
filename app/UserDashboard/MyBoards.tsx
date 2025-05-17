import { View, Text, Image, Alert, TouchableOpacity } from 'react-native'
import React, { useContext, useState, useEffect, useCallback } from 'react'
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import { router, useFocusEffect } from 'expo-router';


export default function MyBoards() {
    const { user, setUser } = useContext(UserContext);
    const [UserBoards, setUserBoards] = useState<{ boardName: string }[]>([]);
    const [Loading, setLoading] = useState(false);
    const [UserData, setUserData] = useState();


    const getCategoryColor = (category: any) => {
        switch (category) {
            case 'People': return '#FACC15'; // yellow-400
            case 'Actions': return '#EF4444'; // red-500
            case 'Feelings': return '#22C55E'; // green-500
            case 'Things': return '#3B82F6'; // blue-500
            case 'Places': return '#8B5CF6'; // purple-500
            default: return '#D1D5DB'; // gray-300
        }
    };

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
        }, [user])
    );

    return (
        <View style={{ justifyContent: "flex-start", alignItems: "center", height: "100%", gap: "1%", backgroundColor: "#fff6eb" }}>
            <Image resizeMode='cover' style={{ height: 100, width: '100%', marginBottom: 20 }} source={require('../../assets/backgrounds/header_background_img.png')} />
            <View style={{ width: '80%', minWidth: 400 }}>
                <Text style={{ fontSize: 30, fontWeight: "bold", color: "#000", width: '100%', backgroundColor: "white", textAlign: "center", paddingVertical: 2, borderWidth: 1.5, borderStyle: 'dashed' }}>MY BOARDS</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignContent: 'center', padding: 5, flexWrap: 'wrap' }}>
                    {
                        UserBoards.map((board, index) => {
                            return (<>
                                <TouchableOpacity key={index} onPress={() => { router.push({ pathname: '/UserBoard/Board' }) }}>
                                    <View

                                        style={{
                                            width: 100,
                                            height: 100,
                                            padding: 8,
                                            borderRadius: 8,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: 4,
                                            backgroundColor: 'blue'
                                        }}
                                    >
                                        <View style={{
                                            width: '100%',
                                            height: '50%',
                                            backgroundColor: 'white',
                                            borderRadius: 8,
                                            marginBottom: 8,
                                        }}>

                                        </View>

                                        <Text adjustsFontSizeToFit style={{
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
                                        }}>{board.boardName}</Text>
                                    </View>
                                </TouchableOpacity >
                            </>

                            )
                        })
                    }
                </View>
            </View>

        </View >
    )
}