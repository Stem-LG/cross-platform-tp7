import { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Platform } from "react-native";
import { Appbar, TextInput, Button, Surface, Text } from "react-native-paper";
import { useLocalSearchParams, router } from "expo-router";
import { useChat } from "../../lib/hooks/useChat";
import { useAuth } from "../../lib/hooks/useAuth";
import { Message } from "../../lib/types";

export default function Chat() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { messages, loading, sendMessage } = useChat(id);
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState("");

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        try {
            await sendMessage(newMessage);
            setNewMessage("");
        } catch (error) {
            console.error(error);
        }
    };

    const renderItem = ({ item }: { item: Message }) => {
        const isOwnMessage = item.senderId === user?.id;

        return (
            <Surface style={[styles.message, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
                {!isOwnMessage && <Text style={styles.sender}>{item.senderName}</Text>}
                <Text>{item.content}</Text>
            </Surface>
        );
    };

    const sortedMessages = [...messages].sort((a, b) => a.createdAt - b.createdAt);

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Chat" />
            </Appbar.Header>

            <View style={styles.chatContainer}>
                <FlatList
                    data={sortedMessages}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    refreshing={loading}
                    onRefresh={() => {}}
                    contentContainerStyle={styles.messageList}
                />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                    style={styles.input}
                    right={<TextInput.Icon icon="send" onPress={handleSend} disabled={!newMessage.trim()} />}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chatContainer: {
        flex: 1,
        justifyContent: "flex-end",
    },
    messageList: {
        padding: 16,
        flexGrow: 1,
        justifyContent: "flex-end",
    },
    message: {
        padding: 8,
        marginVertical: 4,
        maxWidth: "80%",
        borderRadius: 8,
        elevation: 1,
    },
    ownMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#E3F2FD",
    },
    otherMessage: {
        alignSelf: "flex-start",
        backgroundColor: "white",
    },
    sender: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
    },
    inputContainer: {
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    input: {
        backgroundColor: "white",
    },
});
