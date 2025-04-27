import { Redirect, Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StatusBar } from "react-native";



export default function UserEntryLayout() {



    return (
        <>
            <StatusBar hidden={true} />
            <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#043b64" }}>
                <Tabs.Screen name="Login"
                    options={{
                        title: "LOGIN",
                        tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="login" color={color} />
                    }}
                />
                <Tabs.Screen name="Signup"
                    options={{
                        title: "SIGNUP",
                        tabBarIcon: ({ color }) => <FontAwesome size={28} name="user-plus" color={color} />
                    }}
                />
            </Tabs>
        </>
    );
}