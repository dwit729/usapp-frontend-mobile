import { View, Text, Image, TextInput, Switch, ActivityIndicator, Alert, Modal, Button } from 'react-native';
import ActionButton from "../../components/Buttons/ActionButton";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import textInputStyles from '../../styles/textInputStyles';
import axios from 'axios';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { BoardContext } from '../../contexts/BoardContext';

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const auth = FIREBASE_AUTH;
    const { setUser, user } = useContext(UserContext);
    const [PasswordReset, setPasswordReset] = useState(false);
    const [loadingReset, setLoadingReset] = useState(false);

    const validateInputs = () => {
        if (username.length < 5 || password.length < 5) {
            alert("Username and password must have at least 5 characters.");
            return false;
        }
        return true;
    };

    useEffect(() => {
        if (user) {
            console.log("current user", user);
            router.navigate({
                pathname: "/UserDashboard/Main"
            });
        }
    }, [user]);


    const handleLogin = async () => {
        if (!validateInputs()) return;

        setLoading(true);
        setErrorMessage('');
        try {

            const userCredential = await signInWithEmailAndPassword(auth, username, password);
            const uid = userCredential.user.uid;
            await setUser({ userId: uid });


        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Login failed.";
            if (typeof error === 'object' && error !== null && 'code' in error) {
                if (error.code === 'auth/user-not-found') {
                    Alert.alert("Login Error", "No user found with this username.");
                } else if (error.code === 'auth/wrong-password') {
                    Alert.alert("Login Error", "Wrong Password.");
                } else if (error.code === 'auth/invalid-email') {
                    Alert.alert("Login Error", "Invalid Email.");
                } else {
                    Alert.alert("Login Error", errorMsg);
                }
            } else {
                Alert.alert("Login Error", errorMsg);
            }
        } finally {
            setLoading(false);
        }

    };

    const handlePasswordReset = () => {
        setLoadingReset(true);
        sendPasswordResetEmail(auth, username)
            .then(() => {
                Alert.alert("Success", "Password reset email sent successfully.");
            })
            .catch((error) => {
                const errorMsg = error instanceof Error ? error.message : "Failed to send password reset email.";
                Alert.alert("Error", errorMsg);
            })
            .finally(() => {
                setLoadingReset(false);
                setPasswordReset(false);
            });
    };

    return (
        <View style={{ justifyContent: "flex-start", alignItems: "center", height: "100%", gap: "2%", backgroundColor: "#fff6eb" }}>
            <Image resizeMode='cover' style={{ height: 100, width: '100%', marginBottom: 20 }} source={require('../../assets/backgrounds/header_background_img.png')} />
            <Text style={{ fontSize: 60, textAlign: 'center', width: '80%', marginBottom: 20, fontWeight: "bold", color: '#043b64' }}>LOGIN</Text>
            <View style={{ justifyContent: "flex-start", alignItems: "center", paddingVertical: 40, gap: 20, width: "95%", backgroundColor: "#ffffff", borderRadius: 20, borderWidth: 2, borderColor: '#043b64', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 }}>
                <TextInput
                    placeholder='Username'
                    style={textInputStyles.retroTextInput}
                    value={username}
                    onChangeText={setUsername}
                />
                <TextInput
                    placeholder='Password'
                    secureTextEntry={!showPassword}
                    style={textInputStyles.retroTextInput}
                    value={password}
                    onChangeText={setPassword}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: "80%", alignItems: 'center', marginVertical: 10, paddingLeft: 1 }}>
                    <Text style={{ marginRight: 8, color: '#043b64', textDecorationLine: 'underline' }} onPress={() => setPasswordReset(true)}>Forgot Password?</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Switch
                            value={showPassword}
                            onValueChange={setShowPassword}
                        />
                        <Text style={{ marginLeft: 8 }}>Show Password</Text>
                    </View>
                </View>
                {loading ? (
                    <ActivityIndicator size="large" color="#043b64" />
                ) : (
                    <ActionButton
                        title="LOGIN"
                        color="#d7f1f8"
                        width="80%"
                        onPress={handleLogin}
                    />
                )}
            </View>


            {PasswordReset &&
                <Modal transparent={true} animationType="slide" visible={PasswordReset}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View style={{ width: '80%', backgroundColor: '#fff6eb', borderRadius: 20, padding: 20, alignItems: 'center', gap: 10 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#043b64', marginBottom: 20 }}>Reset Password</Text>
                            {loadingReset ? (
                                <ActivityIndicator size="large" color="#043b64" />
                            ) : (
                                <>
                                    <TextInput
                                        placeholder='Enter your email'
                                        style={[textInputStyles.retroTextInput, { marginBottom: 10 }]}
                                        value={username}
                                        onChangeText={setUsername}
                                    />
                                    <ActionButton
                                        title="Send Reset Email"
                                        color="#d7f1f8"
                                        width="100%"
                                        onPress={handlePasswordReset}
                                    />
                                    <ActionButton
                                        title="Cancel"
                                        color="#f8d7da"
                                        width="100%"
                                        onPress={() => setPasswordReset(false)}
                                        style={{ marginTop: 10 }}
                                    />
                                </>
                            )}
                        </View>
                    </View>
                </Modal>}
        </View>
    );
}