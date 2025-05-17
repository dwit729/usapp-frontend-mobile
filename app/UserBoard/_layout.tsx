import { Stack } from "expo-router";


export default function BoardLayout() {
  return (
    <Stack screenOptions={{ orientation: 'landscape', statusBarHidden: true, headerStyle: { backgroundColor: '#3e6888' } }} />
  );
}

