import { Tabs, Redirect } from "expo-router";


export default function UserEntryLayout() {

    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="Main" />
            <Tabs.Screen name="MyBoards" />
            <Tabs.Screen name="Accounts" />
        </Tabs>
    )
}