import { View, Text, Image } from 'react-native'
import React from 'react'

export default function MyBoards() {
    return (
        <View style={{ justifyContent: "flex-start", alignItems: "center", height: "100%", gap: "1%", backgroundColor: "#fff6eb" }}>
            <Image resizeMode='cover' style={{ height: 100, width: '100%', marginBottom: 20 }} source={require('../../assets/backgrounds/header_background_img.png')} />
            <Text style={{ fontSize: 30, fontWeight: "bold", color: "#000", width: "80%", backgroundColor: "white", textAlign: "center", paddingVertical: 2, borderWidth: 1.5, borderStyle: 'dashed' }}>MY BOARDS</Text>
        </View>
    )
}