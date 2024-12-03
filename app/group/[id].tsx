import { useState } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { Appbar, List, IconButton, Portal, Modal, TextInput, Button, FAB, Menu } from "react-native-paper";
import { useLocalSearchParams, router } from "expo-router";
import { useNotes } from "../../lib/hooks/useNotes";
import { Note } from "../../lib/types";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function GroupDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { notes, loading, createNote, updateNote, deleteNote } = useNotes(id);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">("create");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const filteredNotes = selectedDate
        ? notes.filter(note => {
            const noteDate = new Date(note.createdAt);
            return noteDate.toDateString() === selectedDate.toDateString();
        })
        : notes;

    const handleDateChange = (event: any, date?: Date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
        }
    };

    const clearDateFilter = () => {
        setSelectedDate(null);
    };

    const handleCreateNote = async () => {
        try {
            await createNote(title, content);
            setModalVisible(false);
            setTitle("");
            setContent("");
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateNote = async () => {
        if (!selectedNote) return;
        try {
            await updateNote(selectedNote.id, title, content);
            setModalVisible(false);
            setTitle("");
            setContent("");
            setSelectedNote(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteNote = async () => {
        if (!selectedNote) return;
        try {
            await deleteNote(selectedNote.id);
            setModalVisible(false);
            setSelectedNote(null);
        } catch (error) {
            console.error(error);
        }
    };

    const openCreateModal = () => {
        setModalMode("create");
        setTitle("");
        setContent("");
        setModalVisible(true);
    };

    const openEditModal = (note: Note) => {
        setModalMode("edit");
        setSelectedNote(note);
        setTitle(note.title);
        setContent(note.content);
        setModalVisible(true);
    };

    const openDeleteModal = (note: Note) => {
        setModalMode("delete");
        setSelectedNote(note);
        setModalVisible(true);
    };

    const renderItem = ({ item }: { item: Note }) => {
        const date = new Date(item.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return (
            <List.Item
                title={item.title}
                description={
                    <View>
                        <Text style={styles.content}>{item.content}</Text>
                        <Text style={styles.date}>Posted on {formattedDate}</Text>
                    </View>
                }
                right={() => (
                    <View style={styles.actions}>
                        <IconButton icon="pencil" onPress={() => openEditModal(item)} />
                        <IconButton icon="delete" onPress={() => openDeleteModal(item)} />
                    </View>
                )}
            />
        );
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Notes" />
                <Appbar.Action 
                    icon="calendar" 
                    onPress={() => setShowDatePicker(true)} 
                />
                {selectedDate && (
                    <Appbar.Action 
                        icon="close" 
                        onPress={clearDateFilter} 
                    />
                )}
                <Appbar.Action icon="chat" onPress={() => router.push(`/chat/${id}`)} />
            </Appbar.Header>

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    onChange={handleDateChange}
                />
            )}

            <FlatList
                data={filteredNotes}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                refreshing={loading}
                onRefresh={() => {}}
            />

            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={styles.modal}
                >
                    {modalMode === "delete" ? (
                        <View>
                            <TextInput label="Note Title" value={selectedNote?.title} disabled style={styles.input} />
                            <Button mode="contained" onPress={handleDeleteNote} style={styles.button}>
                                Delete Note
                            </Button>
                            <Button mode="outlined" onPress={() => setModalVisible(false)}>
                                Cancel
                            </Button>
                        </View>
                    ) : (
                        <View>
                            <TextInput label="Title" value={title} onChangeText={setTitle} style={styles.input} />
                            <TextInput
                                label="Content"
                                value={content}
                                onChangeText={setContent}
                                multiline
                                numberOfLines={4}
                                style={styles.input}
                            />
                            <Button
                                mode="contained"
                                onPress={modalMode === "create" ? handleCreateNote : handleUpdateNote}
                                style={styles.button}
                            >
                                {modalMode === "create" ? "Create Note" : "Update Note"}
                            </Button>
                            <Button mode="outlined" onPress={() => setModalVisible(false)}>
                                Cancel
                            </Button>
                        </View>
                    )}
                </Modal>
            </Portal>

            <FAB icon="plus" style={styles.fab} onPress={openCreateModal} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    actions: {
        flexDirection: "row",
    },
    content: {
        fontSize: 14,
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    modal: {
        backgroundColor: "white",
        padding: 20,
        margin: 20,
        borderRadius: 8,
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginBottom: 8,
    },
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
