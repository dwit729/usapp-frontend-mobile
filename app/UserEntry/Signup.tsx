import { View, Text, Image, TextInput, Switch, ScrollView, KeyboardAvoidingView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import ActionButton from "../../components/Buttons/ActionButton";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import textInputStyles from '../../styles/textInputStyles';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { Dropdown } from 'react-native-element-dropdown';
import Checkbox from 'expo-checkbox';
import { Alert } from 'react-native';


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
    const [isVerified, setIsVerified] = useState(false);
    const [showVerificationScreen, setshowVerificationScreen] = useState(false);

    const [CurrentUser, setCurrentUser] = useState<any>();
    const auth = FIREBASE_AUTH;

    const userTypeOptions = [
        { label: 'End-User', value: 'End-User' },
        { label: 'Guardian', value: 'Guardian' },
    ];

    const validateInputs = () => {
        if (firstName.length < 5 || lastName.length < 5 || username.length < 5 || email.length < 5) {
            Alert.alert("Incomplete Information", "Please complete all information properly.");
            return false;
        }
        if (userType === 'Guardian' && (endName.length < 5 || endAge.length === 0)) {
            Alert.alert("Guardian Info Required", "Guardian must provide End-User's name and age.");
            return false;
        }
        if (parseInt(age) < 18) {
            Alert.alert("Age Restriction", "Guardian must be an adult (18+ years old).");
            return false;
        }
        if (!isConditionsRead) {
            Alert.alert("Terms & Conditions", "Please read and agree to the terms and conditions");
            return false;
        }
        if (password !== confirmPassword) {
            Alert.alert("Password Mismatch", "Passwords do not match");
            return false;
        }
        return true;
    };

    const handleDeleteUser = async () => {
        if (CurrentUser) {
            try {
                await CurrentUser.delete();
                alert("Signup cancelled.");
                setshowVerificationScreen(false);
                router.navigate("/UserEntry/Signup");
            } catch (error) {
                alert("Error deleting user: " + (error instanceof Error ? error.message : "Unknown error"));
            }
        }
    };

    const SignupUser = async () => {
        if (!validateInputs()) {
            return;
        }
        else {

        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            setCurrentUser(user)

            // Send email verification
            const verify = await sendEmailVerification(user)

            // Show verification screen
            setshowVerificationScreen(true);
            console.log(user.emailVerified)
            const intervalId = setInterval(async () => {
                await user.reload();

                if (user.emailVerified) {
                    setIsLoading(true);
                    clearInterval(intervalId);
                    setshowVerificationScreen(false);

                    const userData = {
                        uid: user.uid,
                        firstName,
                        lastName,
                        username,
                        email,
                        userType,
                        age,
                        ...(userType === 'Guardian' && { endName, endAge }),
                    };

                    await axios.post('https://usapp-backend.vercel.app/api/users/create', userData)
                    alert("User created and email verified successfully!");
                    setIsLoading(false)
                    router.navigate("/UserEntry/Login");

                }
            }, 3000);



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
                        <View style={{ alignSelf: 'center', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ marginBottom: 4, color: '#043b64', fontWeight: 'bold', width: '80%' }}>
                                User Type <Text style={{ color: 'red' }}>*</Text>
                            </Text>
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
                            {userType === '' && (
                                <Text style={{ color: 'red', fontSize: 12, width: '80%' }}>
                                    Please select a user type.
                                </Text>
                            )}
                        </View>
                        <View style={{ alignSelf: 'center', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ marginBottom: 4, color: '#043b64', fontWeight: 'bold', width: '80%' }}>
                                Age <Text style={{ color: 'red' }}>*</Text>
                            </Text>
                            <TextInput
                                placeholder='Age'
                                style={textInputStyles.retroTextInput}
                                value={age}
                                onChangeText={setAge}
                                keyboardType="numeric"
                            />
                            {age.length === 0 ? (
                                <Text style={{ color: 'red', fontSize: 12, width: '80%' }}>
                                    Age is required.
                                </Text>
                            ) : isNaN(Number(age)) ? (
                                <Text style={{ color: 'red', fontSize: 12, width: '80%' }}>
                                    Age must be a number.
                                </Text>
                            ) : Number(age) < 18 && userType === 'Guardian' ? (
                                <Text style={{ color: 'red', fontSize: 12, width: '80%' }}>
                                    Guardian must be at least 18 years old.
                                </Text>
                            ) : (
                                <Text style={{ color: 'green', fontSize: 12, width: '80%' }}>
                                    Looks good!
                                </Text>
                            )}
                        </View>
                        {userType === 'Guardian' && (
                            <>
                                <View style={{ alignSelf: 'center', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ marginBottom: 4, color: '#043b64', fontWeight: 'bold', width: '80%' }}>
                                        End-User's Name <Text style={{ color: 'red' }}>*</Text>
                                    </Text>
                                    <TextInput
                                        placeholder="End-User's Name"
                                        style={textInputStyles.retroTextInput}
                                        value={endName}
                                        onChangeText={setEndName}
                                    />
                                    {endName.length === 0 ? (
                                        <Text style={{ color: 'red', fontSize: 12, width: '80%' }}>
                                            End-User's name is required.
                                        </Text>
                                    ) : endName.length < 5 ? (
                                        <Text style={{ color: 'red', fontSize: 12, width: '80%' }}>
                                            Name must be at least 5 characters.
                                        </Text>
                                    ) : (
                                        <></>
                                    )}
                                </View>
                                <View style={{ alignSelf: 'center', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ marginBottom: 4, color: '#043b64', fontWeight: 'bold', width: '80%' }}>
                                        End-User's Age <Text style={{ color: 'red' }}>*</Text>
                                    </Text>
                                    <TextInput
                                        placeholder="End-User's Age"
                                        style={textInputStyles.retroTextInput}
                                        value={endAge}
                                        onChangeText={setEndAge}
                                        keyboardType="numeric"
                                    />
                                    {endAge.length === 0 ? (
                                        <Text style={{ color: 'red', fontSize: 12, width: '80%' }}>
                                            End-User's age is required.
                                        </Text>
                                    ) : isNaN(Number(endAge)) ? (
                                        <Text style={{ color: 'red', fontSize: 12, width: '80%' }}>
                                            Age must be a number.
                                        </Text>
                                    ) : (
                                        <Text style={{ color: 'green', fontSize: 12, width: '80%' }}>
                                            Looks good!
                                        </Text>
                                    )}
                                </View>
                            </>
                        )}


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
                        <View style={{ alignSelf: 'center', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ marginBottom: 4, color: '#043b64', fontWeight: 'bold', width: '80%' }}>
                                First Name <Text style={{ color: 'red' }}>*</Text>
                            </Text>
                            <TextInput
                                placeholder='First Name'
                                style={textInputStyles.retroTextInput}
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                            {firstName.length === 0 ? (
                                <Text style={{ color: 'red', fontSize: 12, width: '80%' }}>
                                    First name is required.
                                </Text>
                            ) : firstName.length < 2 ? (
                                <Text style={{ color: 'red', fontSize: 12, width: '80%' }}>
                                    First name must be at least 2 characters.
                                </Text>
                            ) : (
                                <Text style={{ color: 'green', fontSize: 12, width: '80%' }}>
                                    Looks good!
                                </Text>
                            )}
                        </View>
                        <View style={{ alignSelf: 'center', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ marginBottom: 4, color: '#043b64', fontWeight: 'bold', width: '80%' }}>
                                Last Name <Text style={{ color: 'red' }}>*</Text>
                            </Text>
                            <TextInput
                                placeholder='Last Name'
                                style={textInputStyles.retroTextInput}
                                value={lastName}
                                onChangeText={setLastName}
                            />
                            {lastName.length === 0 ? (
                                <Text style={{ color: 'red', fontSize: 12, width: '80%' }}>
                                    Last name is required.
                                </Text>
                            ) : lastName.length < 2 ? (
                                <Text style={{ color: 'red', fontSize: 12, width: '80%' }}>
                                    Last name must be at least 2 characters.
                                </Text>
                            ) : (
                                <Text style={{ color: 'green', fontSize: 12, width: '80%' }}>
                                    Looks good!
                                </Text>
                            )}
                        </View>
                        <View style={{ alignSelf: 'center', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ marginBottom: 4, color: '#043b64', fontWeight: 'bold', width: '80%' }}>
                                Username <Text style={{ color: 'red' }}>*</Text>
                            </Text>
                            <TextInput
                                placeholder='Username'
                                style={textInputStyles.retroTextInput}
                                value={username}
                                onChangeText={setUsername}
                            />
                            {username.length === 0 ? (
                                <Text style={{ color: 'red', fontSize: 12, width: '80%' }}>
                                    Username is required.
                                </Text>
                            ) : username.length < 5 ? (
                                <Text style={{ color: 'red', fontSize: 12, width: '80%' }}>
                                    Username must be at least 5 characters.
                                </Text>
                            ) : (
                                <Text style={{ color: 'green', fontSize: 12, width: '80%' }}>
                                    Looks good!
                                </Text>
                            )}
                        </View>
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
                        {
                            showVerificationScreen &&
                            (
                                <>
                                    <Modal
                                        visible={showVerificationScreen}
                                        animationType="fade"
                                        transparent
                                        onRequestClose={() => setshowVerificationScreen(false)}
                                    >
                                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                                            <View style={{ width: '80%', backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center' }}>
                                                <Text style={{ fontSize: 18, color: '#043b64', fontWeight: 'bold', marginBottom: 10 }}>
                                                    Verify Your Email
                                                </Text>
                                                <Text style={{ fontSize: 16, color: '#043b64', marginBottom: 20, textAlign: 'center' }}>
                                                    A verification link has been sent to your email address. Please check your inbox and verify your email to complete signup.
                                                </Text>
                                                <ActionButton
                                                    title="Cancel Signup"
                                                    color="#f8d7da"
                                                    width="100%"
                                                    onPress={handleDeleteUser}
                                                />
                                            </View>
                                        </View>
                                    </Modal>
                                </>
                            )
                        }
                        <Text style={{ fontSize: 20, textAlign: 'center', width: '80%', marginBottom: 20, fontWeight: "bold", color: '#043b64' }}>Step 3: Account Credentials</Text>
                        <View style={{ alignSelf: 'center', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ marginBottom: 4, color: '#043b64', fontWeight: 'bold', width: '80%' }}>
                                Email <Text style={{ color: 'red' }}>*</Text>
                            </Text>
                            <TextInput
                                placeholder='Email'
                                style={textInputStyles.retroTextInput}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {email.length === 0 ? (
                                <Text style={{ color: 'red', fontSize: 12, width: '80%' }}>
                                    Email is required.
                                </Text>
                            ) : !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email) ? (
                                <Text style={{ color: 'red', fontSize: 12, width: '80%' }}>
                                    Please enter a valid email address.
                                </Text>
                            ) : (
                                <Text style={{ color: 'green', fontSize: 12, width: '80%' }}>
                                    Looks good!
                                </Text>
                            )}
                        </View>
                        <View style={{ alignSelf: 'center', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ marginBottom: 4, color: '#043b64', fontWeight: 'bold', width: '80%' }}>
                                Password <Text style={{ color: 'red' }}>*</Text>
                            </Text>
                            <TextInput
                                placeholder='Password'
                                secureTextEntry={!showPassword}
                                style={textInputStyles.retroTextInput}
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>
                        <View style={{ alignSelf: 'center', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ marginBottom: 4, color: '#043b64', fontWeight: 'bold', width: '80%' }}>
                                Confirm Password <Text style={{ color: 'red' }}>*</Text>
                            </Text>
                            <TextInput
                                placeholder='Confirm Password'
                                secureTextEntry={!showPassword}
                                style={textInputStyles.retroTextInput}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>
                        {password.length > 0 && (
                            <Text style={{
                                width: '80%',
                                alignSelf: 'center',
                                marginBottom: 8,
                                color:
                                    password.length < 8 ||
                                        !/[A-Z]/.test(password) ||
                                        !/[a-z]/.test(password) ||
                                        !/[0-9]/.test(password) ||
                                        !/[^A-Za-z0-9]/.test(password)
                                        ? 'red'
                                        : 'green',
                                fontSize: 13,
                                fontWeight: 'bold'
                            }}>
                                {password.length < 8
                                    ? 'Password must be at least 8 characters. '
                                    : ''}
                                {!/[A-Z]/.test(password)
                                    ? 'Include an uppercase letter. '
                                    : ''}
                                {!/[a-z]/.test(password)
                                    ? 'Include a lowercase letter. '
                                    : ''}
                                {!/[0-9]/.test(password)
                                    ? 'Include a number. '
                                    : ''}
                                {!/[^A-Za-z0-9]/.test(password)
                                    ? 'Include a special character. '
                                    : ''}
                                {password.length >= 8 &&
                                    /[A-Z]/.test(password) &&
                                    /[a-z]/.test(password) &&
                                    /[0-9]/.test(password) &&
                                    /[^A-Za-z0-9]/.test(password)
                                    ? 'Strong password!'
                                    : ''}
                            </Text>
                        )}
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
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-start", alignItems: "center", backgroundColor: "#fff6eb", paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 60, textAlign: 'center', width: '80%', marginBottom: 20, fontWeight: "bold", color: '#043b64' }}>SIGNUP</Text>
                <View style={{ justifyContent: "flex-start", alignItems: "center", paddingVertical: 40, gap: 10, width: "100%", backgroundColor: "#ffffff", borderRadius: 20, borderWidth: 2, borderColor: '#043b64', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 }}>
                    {renderStep()}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
