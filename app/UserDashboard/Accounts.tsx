import { View, Text, Image } from 'react-native'
import React from 'react'

export default function Accounts() {
    return (
        <View style={{ justifyContent: "flex-start", alignItems: "center", height: "100%", gap: "5%", backgroundColor: "#fff6eb" }}>
            <Image resizeMode='cover' style={{ height: 100, width: '100%', marginBottom: 20 }} source={require('../../assets/backgrounds/header_background_img.png')} />

        </View>
    )
}