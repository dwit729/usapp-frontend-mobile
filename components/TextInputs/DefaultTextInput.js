import { View, Text, TextInput, StyleSheet } from 'react-native'
import React from 'react'

export default function DefaultTextInput(props) {



  const { label, placeholder, bgcolor, labelColor, setter, getter, secure, width, style, type, } = props;

  const styles = StyleSheet.create({
    text_input: {
      paddingLeft: 5,
      paddingRight: 5,
      paddingTop: 2,
      paddingBottom: 2,
      backgroundColor: (bgcolor ? bgcolor : 'white'),
      // maxWidth: '80%',
      flexGrow: 1,
      borderBottomRightRadius: 3,
      borderTopRightRadius: 3,
      fontSize: 18,
      overflow: 'scroll',
      flex: 10

    },
    container: {
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: (labelColor ? labelColor : 'black'),
      borderRadius: 5,
      borderWidth: 1,
      borderBottomWidth: 4,
      borderRightWidth: 4,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      width: (width ? width : '100%'),
      maxHeight: 35,
      alignItems: 'center',
      justifyContent: 'center'

    },
    label: {
      color: 'white',
      fontWeight: 'bold',
      alignSelf: 'center',
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 2,
      paddingBottom: 2,
      minWidth: '10%',
      height: 35,
      verticalAlign: 'middle'
    }
  })

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}:</Text>
      <TextInput keyboardType={(type ? type : 'default')}
        style={styles.text_input}
        placeholder={placeholder}
        onChangeText={setter}
        value={getter}
        secureTextEntry={secure} />
    </View>

  )
}