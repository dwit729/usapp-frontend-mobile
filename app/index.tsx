import { Text, View, Image, TextInput } from "react-native";
import ActionButton from "../components/Buttons/ActionButton"
import { Link, useRouter } from "expo-router";


export default function Index() {

  const router = useRouter();
  return (
    <View style={{ justifyContent: "flex-start", alignItems: "center", height: "100%", gap: "2%", backgroundColor: "#fff6eb" }}>
      <Image resizeMode='cover' style={{ height: 100, width: '100%' }} source={require('../assets/backgrounds/header_background_img.png')} />
      <Image resizeMode='contain' style={{ width: '70%', maxWidth: 400 }} source={require('../assets/images/logos/usapp_logo_medium.png')} />
      <Text style={{ fontSize: 18, textAlign: 'center', width: '80%', marginBottom: 10 }}>Ipahayag ang sarili gamit ang UsApp!, isang Filipino Communication Board App. Katulong mo sa bawat salita</Text>
      <ActionButton title="Get Started" color="#d7f1f8" width={200} onPress={() => { router.navigate("/UserEntry/Login") }} />
      <ActionButton title="Enter as Guest" color="#ffbc4d" width={200} onPress={() => { router.navigate("/guestboard") }} />

    </View>
  );
}
