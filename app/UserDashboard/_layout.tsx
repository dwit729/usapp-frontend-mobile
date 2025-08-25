import { Tabs, Redirect } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { FontAwesome5 } from "@expo/vector-icons";
export default function UserEntryLayout() {

    return (

        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#043b64", }}>

            <Tabs.Screen name="MyBoards"
                options={{

                    title: "My Boards",
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />
                }}
            />
            <Tabs.Screen name="CreateBoard"
                options={{
                    title: "Create Board",
                    tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="folder-plus" color={color} />
                }}
            />
            <Tabs.Screen name="Accounts"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="gear" color={color} />
                }}
            />

        </Tabs>

    )
}