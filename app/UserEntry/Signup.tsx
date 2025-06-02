import { View, Text, Image, TextInput, Switch, ScrollView, KeyboardAvoidingView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import ActionButton from "../../components/Buttons/ActionButton";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import textInputStyles from '../../styles/textInputStyles';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Dropdown } from 'react-native-element-dropdown';
import Checkbox from 'expo-checkbox';


export default function Signup() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userType, setUserType] = useState('User');
    const [age, setAge] = useState('');
    const [endAge, setEndAge] = useState('');
    const [endName, setEndName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConditionsRead, setisConditionsRead] = useState(false);
    const [showTerms, setshowTerms] = useState(false);
    const auth = FIREBASE_AUTH;

    const userTypeOptions = [
        { label: 'End-User', value: 'End-User' },
        { label: 'Guardian', value: 'Guardian' },
    ];

    const validateInputs = () => {
        if (firstName.length < 5 || lastName.length < 5 || username.length < 5 || email.length < 5) {
            alert("Please complete all information properly.");
            return false;
        }
        if (userType === 'Guardian' && (endName.length < 5 || endAge.length === 0)) {
            alert("Guardian must provide End-User's name and age.");
            return false;
        }
        if (parseInt(age) < 18) {
            alert("Guardian must be an adult (18+ years old).");
            return false;
        }
        if (!isConditionsRead) {
            alert("Please read and agree to the terms and conditions")
        }
        return true;
    };

    const SignupUser = async () => {
        if (!validateInputs()) {
            return;
        }
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            const userData = {
                uid,
                firstName,
                lastName,
                username,
                email,
                userType,
                age,
                ...(userType === 'Guardian' && { endName, endAge }),
            };

            await axios.post('https://usapp-backend.vercel.app/api/users/create', userData);

            alert("User created successfully!");
            router.navigate("/UserEntry/Login");
        } catch (error) {
            console.error(error);
            alert("Error creating user: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <Text style={{ fontSize: 20, textAlign: 'center', width: '80%', marginBottom: 20, fontWeight: "bold", color: '#043b64' }}>Step 1: User Type Information</Text>
                        <Dropdown
                            data={userTypeOptions}
                            labelField="label"
                            valueField="value"
                            placeholder="Select User Type"
                            value={userType}
                            onChange={item => setUserType(item.value)}
                            style={{
                                height: 50,
                                width: "80%",
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
                        <TextInput
                            placeholder='Age'
                            style={textInputStyles.retroTextInput}
                            value={age}
                            onChangeText={setAge}
                            keyboardType="numeric"
                        />
                        {userType === 'Guardian' && (
                            <>
                                <TextInput
                                    placeholder="End-User's Name"
                                    style={textInputStyles.retroTextInput}
                                    value={endName}
                                    onChangeText={setEndName}
                                />
                                <TextInput
                                    placeholder="End-User's Age"
                                    style={textInputStyles.retroTextInput}
                                    value={endAge}
                                    onChangeText={setEndAge}
                                    keyboardType="numeric"
                                />
                            </>
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: "80%", height: 100, alignItems: 'center', marginVertical: 10, paddingLeft: 1 }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: "80%" }}>
                            <ActionButton
                                title="Next"
                                color="#d7f1f8"
                                width="48%"
                                onPress={() => setCurrentStep(2)}
                            />
                        </View>
                    </>
                );
            case 2:
                return (
                    <>
                        <Text style={{ fontSize: 20, textAlign: 'center', width: '80%', marginBottom: 20, fontWeight: "bold", color: '#043b64' }}>Step 2: Personal Information</Text>
                        <TextInput
                            placeholder='First Name'
                            style={textInputStyles.retroTextInput}
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                        <TextInput
                            placeholder='Last Name'
                            style={textInputStyles.retroTextInput}
                            value={lastName}
                            onChangeText={setLastName}
                        />
                        <TextInput
                            placeholder='Username'
                            style={textInputStyles.retroTextInput}
                            value={username}
                            onChangeText={setUsername}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: "80%", height: 50, alignItems: 'center', marginVertical: 10, paddingLeft: 1 }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: "80%" }}>
                            <ActionButton
                                title="Back"
                                color="#d7f1f8"
                                width="48%"
                                buttonStyle={{ alignSelf: 'flex-end' }}
                                onPress={() => setCurrentStep(1)}
                            />
                            <ActionButton
                                title="Next"
                                color="#d7f1f8"
                                width="48%"
                                buttonStyle={{ alignSelf: 'flex-end' }}
                                onPress={() => setCurrentStep(3)}
                            />
                        </View>
                    </>
                );
            case 3:
                return (
                    <>
                        {showTerms && (
                            <>
                                <Modal
                                    visible={showTerms}
                                    animationType="fade"
                                    transparent
                                    onRequestClose={() => setshowTerms(false)}
                                >
                                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                                        <View style={{ width: '80%', maxHeight: 400, backgroundColor: '#fff', borderRadius: 10, padding: 20 }}>
                                            <ScrollView>
                                                <Text style={{ fontSize: 16, color: '#043b64', marginBottom: 20 }}>
                                                    Welcome to USAPP! Please read these Terms and Conditions carefully before using our app. By signing up, you agree to abide by all rules and policies.
                                                    {"\n\n"}
                                                    1. You must provide accurate information.
                                                    {"\n"}
                                                    2. Guardians must be 18+ years old.
                                                    {"\n"}
                                                    3. Respect privacy and community guidelines.
                                                    {"\n"}
                                                    4. Your data is protected as per our privacy policy and the Philippine Data Privacy Act of 2012 (Republic Act No. 10173).
                                                    {"\n\n"}
                                                    By using this app and creating an account, you consent to the collection, use, and processing of your personal data in accordance with the Philippine Data Privacy Act. We are committed to safeguarding your information and ensuring your privacy rights.
                                                    {"\n\n"}
                                                    For full details, visit our website or contact support.
                                                </Text>
                                                <ActionButton
                                                    title="Go Back"
                                                    color="#d7f1f8"
                                                    width="100%"
                                                    onPress={() => setshowTerms(false)}
                                                />
                                            </ScrollView>
                                        </View>
                                    </View>
                                </Modal>

                            </>
                        )}
                        <Text style={{ fontSize: 20, textAlign: 'center', width: '80%', marginBottom: 20, fontWeight: "bold", color: '#043b64' }}>Step 3: Account Credentials</Text>
                        <TextInput
                            placeholder='Email'
                            style={textInputStyles.retroTextInput}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                        />
                        <TextInput
                            placeholder='Password'
                            secureTextEntry={!showPassword}
                            style={textInputStyles.retroTextInput}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TextInput
                            placeholder='Confirm Password'
                            secureTextEntry={!showPassword}
                            style={textInputStyles.retroTextInput}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: "80%", alignItems: 'center', marginVertical: 10, paddingHorizontal: 2 }}>
                            <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                                <Checkbox value={isConditionsRead} onValueChange={setisConditionsRead} />
                                <Text>Agree to  <Text onPress={() => { setshowTerms(true) }} style={{ textDecorationLine: 'underline', color: 'blue' }}>Terms and Conditions</Text></Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Switch
                                    value={showPassword}
                                    onValueChange={setShowPassword} />
                                <Text style={{ marginLeft: 8 }}>Show Password</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: "80%" }}>
                            <ActionButton
                                title="Back"
                                color="#d7f1f8"
                                width="48%"
                                onPress={() => setCurrentStep(2)}
                            />
                            <ActionButton
                                title="Signup"
                                color="#d7f1f8"
                                width="48%"
                                onPress={SignupUser}
                            />
                        </View>
                    </>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <SafeAreaProvider style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff6eb' }}>
                <ActivityIndicator size="large" color="#043b64" />
                <Text style={{ marginTop: 10, fontSize: 16, color: '#043b64' }}>Creating your account...</Text>
            </SafeAreaProvider>
        );
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff6eb' }} behavior="padding">
            <Image resizeMode='cover' style={{ height: 100, width: '100%', marginBottom: 20 }} source={require('../../assets/backgrounds/header_background_img.png')} />
            <View style={{ flex: 1, height: "100%", justifyContent: "flex-start", alignItems: "center", backgroundColor: "#fff6eb", paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 60, textAlign: 'center', width: '80%', marginBottom: 20, fontWeight: "bold", color: '#043b64' }}>SIGNUP</Text>
                <View style={{ justifyContent: "flex-start", alignItems: "center", paddingVertical: 40, gap: 20, width: "100%", backgroundColor: "#ffffff", borderRadius: 20, borderWidth: 2, borderColor: '#043b64', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 }}>
                    {renderStep()}
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
