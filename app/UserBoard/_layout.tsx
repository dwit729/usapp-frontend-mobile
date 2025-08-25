import { Stack } from "expo-router";


export default function BoardLayout() {
  return (
    <Stack screenOptions={{ orientation: 'landscape', navigationBarHidden: true, statusBarTranslucent: true, statusBarHidden: true, headerStyle: { backgroundColor: '#3e6888' }, navigationBarTranslucent: true }} />
  );
}

