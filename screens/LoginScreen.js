import * as React from 'react';
import { View, Text, ImageBackground, Image, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView } from 'react-native';
import firebase from 'firebase'

export default class LoginScreen extends React.Component {
    constructor() {
        super()
        this.state = {
            email: "",
            password: ""
        }
    }

    handleLogin = (email, password) => {
        firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then(() => {
                this.props.navigation.navigate("BottomTabs")
            })
            .catch(error => {
                Alert.alert(error.message)
            })
    }
    render() {
        return (
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
                <ImageBackground source={require("../assets/background2.png")}
                    style={{ flex: 1, resizeMode: "cover" }}>
                    <View style={{ flex: 0.5, justifyContent: "center", alignItems: "center" }}>
                        <Image source={require("../assets/appIcon.png")} />
                        <Image source={require("../assets/appName.png")}
                            style={{ marginTop: 20 }} />
                    </View>
                    <View style={{ flex: 0.5, justifyContent: "center", alignItems: "center" }}>
                        <TextInput
                            style={{ width: 200, height: 20, borderWidth: 2 }}
                            placeholder="Enter Email"
                            placeholderTextColor="white"
                            onChangeText={(text) => {
                                this.setState({
                                    email: text
                                })
                            }}
                            autoFocus />
                        <TextInput
                            style={{ width: 200, height: 20, borderWidth: 2, marginTop: 10 }}
                            placeholder="Enter Password"
                            placeholderTextColor="white"
                            onChangeText={(text) => {
                                this.setState({
                                    password: text
                                })
                            }}
                            secureTextEntry />

                        <TouchableOpacity style={{ backgroundColor: "orange" }}
                            onPress={() => this.handleLogin(this.state.email, this.state.password)}>
                            <Text>
                                Login
                                </Text>
                        </TouchableOpacity>
                    </View>


                </ImageBackground>
            </KeyboardAvoidingView>
        )

    }
}