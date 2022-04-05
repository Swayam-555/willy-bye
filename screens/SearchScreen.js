import * as React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';

import db from '../config';

export default class SearchScreen extends React.Component {
    constructor() {
        super();
        this.state = {
            search: "",
            allTransactions: [],
            lastTransaction: null
        }
    }
    getTransactions = async (searchText) => {
        searchText = searchText.split("")[0].toLowerCase() + searchText.split("")[1].toLowerCase() + searchText.substring(2);
        console.log(searchText)
        var firstAlphabet = searchText.split("")[0];
        if (firstAlphabet === "b") {
            var transaction = await db.collection("transaction").where("bookId", "==", searchText).limit(5).get();
            transaction.docs.map(doc => {
                this.setState({
                    allTransactions: [...this.state.allTransactions, doc.data()],
                    lastTransaction: doc
                })
            })
        }
        else if (firstAlphabet === "s") {
            var transaction = await db.collection("transaction").where("studentId", "==", searchText).limit(5).get();
            transaction.docs.map(doc => {
                this.setState({
                    allTransactions: [...this.state.allTransactions, doc.data()],
                    lastTransaction: doc
                })
            })
        }
    }
    fetchMore = async (searchText) => {
        searchText = searchText.split("")[0].toLowerCase() + searchText.split("")[1].toLowerCase() + searchText.substring(2);
        console.log(searchText)
        var firstAlphabet = searchText.split("")[0];
        if (firstAlphabet === "b") {
            var transaction = await db.collection("transaction").where("bookId", "==", searchText).startAfter(this.state.lastTransaction).limit(5).get();
            transaction.docs.map(doc => {
                this.setState({
                    allTransactions: [...this.state.allTransactions, doc.data()],
                    lastTransaction: doc
                })
            })
            console.log(this.state.allTransactions)
        }
        else if (firstAlphabet === "s") {
            var transaction = await db.collection("transaction").where("studentId", "==", searchText).startAfter(this.state.lastTransaction).limit(5).get();
            transaction.docs.map(doc => {
                this.setState({
                    allTransactions: [...this.state.allTransactions, doc.data()],
                    lastTransaction: doc
                })
            })
        }
    }
    render() {
        return (
            <View>
                <View style={styles.container}>
                    <TextInput
                        placeholder="Enter Book Id or StudentId"
                        style={{ width: 200, height: 30, borderWidth: 2 }}
                        onChangeText={text => {
                            this.setState({
                                search: text
                            })
                        }}>
                    </TextInput>
                    <TouchableOpacity style={{ backgroundColor: "red", width: 70, height: 30, alignItems: "center", justifyContent: "center" }}
                        onPress={() => this.getTransactions(this.state.search)}>
                        <Text style={{ fontSize: 15, fontWeight: "bold" }}>Submit</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={this.state.allTransactions}
                    keyExtractor={(item, index) => { index.toString() }}
                    renderItem={({ item }) => (
                        <View style={{ borderBottomWidth: 2 }}>
                            <Text>{"Book ID:" + item.bookId}</Text>
                            <Text>{"Student ID:" + item.studentId}</Text>
                            <Text>{"Date:" + item.date.toDate()}</Text>
                            <Text>{"Transaction Type:" + item.transactionType}</Text>
                        </View>
                    )}
                    onEndReached={() => this.fetchMore(this.state.search)}
                    onEndReachedThreshold={0.5}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {

        flexDirection: "row"

    }
})
