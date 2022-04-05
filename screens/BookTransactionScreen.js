import * as React from 'react';
import { Text, TextInput, View, StyleSheet, TouchableOpacity, ImageBackground, Image, Alert, KeyboardAvoidingView } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';

import db from "../config";
import firebase from 'firebase';
export default class TransactionScreen extends React.Component {
    constructor() {
        super();
        this.state = {
            domState: "normal",
            hasCameraPermission: null,
            scanned: false,
            scannedData: "",
            bookId: "",
            studentId: ""
        }
    }
    handleCameraPermission = async domstate => {
        const { status } = await Camera.getCameraPermissionsAsync();
        this.setState({
            hasCameraPermission: status === "granted",
            scanned: false,
            domState: domstate
        })
    }
    handleBarCode = async ({ type, data }) => {
        const { domState } = this.state;
        if (domState === "bookId") {
            this.setState({
                bookId: data,
                scanned: true,
                domState: "normal"
            })
        }
        else if (domState === "studentId") {
            this.setState({
                studentId: data,
                scanned: true,
                domState: "normal"
            })
        }

    }

    handleTransaction = async () => {
        var transactionType = await this.checkBookAvailabilty();
        if (!transactionType) {
            Alert.alert("Book not available in the library")
            this.setState({
                bookId: "",
                studentId: ""
            })
        }
        else if (transactionType === "issue") {
            var isStudentEligible = await this.checkStudentEligibilityForIssue();
            if (isStudentEligible) {
                this.initiateBookIssue()
            }
        }
        else {
            var isStudentEligible = await this.checkStudentEligibilityForReturn();
            if (isStudentEligible) {
                this.initiateBookReturn()
            }
        }
    }

    checkBookAvailabilty = async () => {
        var bookRef = await db.collection("books").where("bookId", "==", this.state.bookId).get();
        var transactionType = ""
        if (bookRef.docs.length === 0) {
            transactionType = false
        }
        else {
            bookRef.docs.map(doc => {
                var book = doc.data()
                if (book.book_avlbl === true) {
                    transactionType = "issue"
                }
                else {
                    transactionType = "return"
                }
            })
        }
        return transactionType
    }

    checkStudentEligibilityForIssue = async () => {
        var studentRef = await db.collection("students").where("studentId", "==", this.state.studentId).get();
        var isStudentEligible = "";
        if (studentRef.docs.length === 0) {
            isStudentEligible = false
            Alert.alert("Student does not exist")
            this.setState({
                bookId: "",
                studentId: ""
            })
        }
        else {
            studentRef.docs.map(doc => {
                var student = doc.data();
                if (student.noOfBooksIssued < 2) {
                    isStudentEligible = true
                }
                else {
                    isStudentEligible = false
                    Alert.alert("Student has already issued 2 books");
                    this.setState({
                        bookId: "",
                        studentId: ""
                    })
                }
            })
        }
        return isStudentEligible
    }

    checkStudentEligibilityForReturn = async () => {
        var transactionRef = await db.collection("transaction").where("bookId", "==", this.state.bookId).get();
        var isStudentEligible = "";
        transactionRef.docs.map(doc => {
            var lastTransaction = doc.data();
            if (lastTransaction.studentId === this.state.studentId) {
                isStudentEligible = true
            }
            else {
                isStudentEligible = false;
                Alert.alert("Student did not issue the book")
                this.setState({
                    bookId: "",
                    studentId: ""
                })
            }
        })
        return isStudentEligible
    }
    initiateBookIssue = () => {
        db.collection("transaction")
            .add({
                bookId: this.state.bookId,
                studentId: this.state.studentId,
                transactionType: "Issue",
                date: firebase.firestore.Timestamp.now().toDate()
            })
        db.collection("books").doc(this.state.bookId).update({
            book_avlbl: false
        })
        db.collection("students").doc(this.state.studentId).update({
            noOfBooksIssued: firebase.firestore.FieldValue.increment(1)
        })
        Alert.alert("Book issued")
        this.setState({
            bookId: "",
            studentId: ""
        })
    }
    initiateBookReturn = () => {
        db.collection("transaction").add({
            bookId: this.state.bookId,
            studentId: this.state.studentId,
            transactionType: "return",
            date: firebase.firestore.Timestamp.now().toDate()
        })
        db.collection("books").doc(this.state.bookId).update({
            book_avlbl: true
        })
        db.collection("students").doc(this.state.studentId).update({
            noOfBooksIssued: firebase.firestore.FieldValue.increment(-1)
        })
        Alert.alert("Book returned to the library")
        this.setState({
            bookId: "",
            studentId: ""
        })
    }
    render() {
        const { domState, hasCameraPermission, scanned, scannedData } = this.state;
        if (domState != "normal") {
            return (
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : this.handleBarCode} />
            )
        }
        return (
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
                <ImageBackground
                    source={require("../assets/background2.png")}
                    style={{ resizeMode: "cover", flex: 1, justifyContent: "center" }}>
                    <View style={{
                        flex: 0.5, justifyContent: "center", alignItems: "center"
                    }}>
                        <Image source={require("../assets/appIcon.png")} />
                        <Image source={require("../assets/appName.png")} />
                    </View>
                    <View style={{ flex: 0.5, justifyContent: "center", alignItems: "center" }}>
                        <View style={{ flexDirection: "row" }}>
                            <TextInput
                                style={{ width: 150, height: 20, borderWidth: 2 }}
                                placeholder="Book Id"
                                placeholderTextColor="white"
                                onChangeText={(text) => this.setState({
                                    bookId: text
                                })}
                                value={this.state.bookId} />
                            <TouchableOpacity style={{ backgroundColor: "red" }}
                                onPress={() => this.handleCameraPermission("bookId")}>
                                <Text>Scan</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: "row", marginTop: 10 }}>
                            <TextInput
                                style={{ width: 150, height: 20, borderWidth: 2 }}
                                placeholder="Student Id"
                                placeholderTextColor="white"
                                onChangeText={(text) => this.setState({
                                    studentId: text
                                })}
                                value={this.state.studentId} />
                            <TouchableOpacity style={{ backgroundColor: "red" }}
                                onPress={() => this.handleCameraPermission("studentId")}>
                                <Text>Scan</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={{ backgroundColor: "red" }}
                            onPress={() => this.handleTransaction()}>
                            <Text style={{ fontFamily: "Rajdhani_700Bold" }}>Submit</Text>
                        </TouchableOpacity>
                    </View>


                </ImageBackground>
            </KeyboardAvoidingView >

        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
})
