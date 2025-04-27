import { View, Text, ActivityIndicator, Image } from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { BackHandler, Alert } from 'react-native';
import { router } from 'expo-router';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import { use } from 'react';

export default function Main() {
    const { user, setUser } = useContext(UserContext);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('User ID:', user);
        const fetchUserData = async () => {
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

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            Alert.alert('Hold on!', 'Are you sure you want to exit the app?', [
                { text: 'Cancel', style: 'cancel', onPress: () => null },
                {
                    text: 'YES', onPress: () => {
                        setUser(null);
                        router.replace("/")
                    }
                },
            ]);
            return true;
        });

        return () => backHandler.remove();
    }, [user]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff6eb' }}>
                <ActivityIndicator size="large" color="#333" />
                <Text style={{ marginTop: 10, fontSize: 18, color: '#555' }}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#fff6eb', gap: "1%" }}>
            <Image resizeMode='cover' style={{ height: 100, width: '100%', marginBottom: 20 }} source={require('../../assets/backgrounds/header_background_img.png')} />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'left', width: '80%', textTransform: 'uppercase', marginLeft: 5 }}>Welcome, {userData.username}!</Text>
            <View style={{ minHeight: 300, width: '80%', backgroundColor: '#fff', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Favorite Boards</Text>
            </View>

            <View style={{ minHeight: 300, width: '80%', backgroundColor: '#fff', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Recently Used</Text>
            </View>

        </View>
    );
}
