import { Tabs, Redirect } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
export default function UserEntryLayout() {

    return (

        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#043b64" }}>
            <Tabs.Screen name="Main"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="login" color={color} />
                }}
            />
            <Tabs.Screen name="MyBoards"
                options={{
                    title: "My Boards",
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="user-plus" color={color} />
                }}
            />
            <Tabs.Screen name="CreateBoard"
                options={{
                    title: "Create Board",
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="user-plus" color={color} />
                }}
            />
            <Tabs.Screen name="Accounts"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="user-plus" color={color} />
                }}
            />

        </Tabs>

    )
}