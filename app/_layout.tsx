import { Stack } from "expo-router";
import { UserProvider } from "../contexts/UserContext";

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false, statusBarHidden: true }}>
        <Stack.Screen name="index" options={{ orientation: "portrait" }} />
        <Stack.Screen name="guestboard" options={
          { headerShown: true, title: "USAPP BOARD", headerTitleAlign: "center", orientation: "landscape", headerStyle: { backgroundColor: "#4d8690" }, headerTintColor: "#ffffff", headerTitleStyle: { fontSize: 20, fontWeight: "bold" } }} />
      </Stack>
    </UserProvider>
  );
}
