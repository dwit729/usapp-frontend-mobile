import { Stack } from "expo-router";
import { UserProvider } from "../contexts/UserContext";
import { BoardProvider } from "../contexts/BoardContext"

export default function RootLayout() {
  return (
    <UserProvider>
      <BoardProvider>
        <Stack screenOptions={{ headerShown: false, statusBarHidden: true }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="guestboard" options={
            { headerShown: true, title: "USAPP BOARD", headerTitleAlign: "center", orientation: "landscape", headerStyle: { backgroundColor: "#4d8690" }, headerTintColor: "#ffffff", headerTitleStyle: { fontSize: 20, fontWeight: "bold" } }} />
        </Stack>
      </BoardProvider>
    </UserProvider>
  );
}
