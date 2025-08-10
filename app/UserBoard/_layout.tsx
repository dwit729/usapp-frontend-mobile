import { Stack } from "expo-router";


export default function BoardLayout() {
  return (
    <Stack screenOptions={{ orientation: 'landscape', statusBarTranslucent: true, statusBarHidden: true, headerStyle: { backgroundColor: '#3e6888' } }} />
  );
}

