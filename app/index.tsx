import React, { useState, useRef, useEffect } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import { List, FAB, TextInput, Button, Text, Appbar } from "react-native-paper";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { useRouter } from "expo-router";

import { Classe } from "../lib/types";
import { getClasses, addClass, updateClass, deleteClass, logout } from "../lib/database";

export default function IndexPage() {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [newClassName, setNewClassName] = useState("");
    const [newStudentCount, setNewStudentCount] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [selectedClass, setSelectedClass] = useState<Classe | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        initializeDatabase();
    }, []);

    const initializeDatabase = async () => {
        const fetchedClasses = await getClasses();
        setClasses(fetchedClasses);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        const fetchedClasses = await getClasses();
        setClasses(fetchedClasses);
        setRefreshing(false);
    };

    const openBottomSheet = (classItem?: Classe) => {
        if (classItem) {
            setIsEditing(true);
            setSelectedClass(classItem);
            setNewClassName(classItem.nomClass);
            setNewStudentCount(classItem.nbreEtud.toString());
        } else {
            setIsEditing(false);
            setSelectedClass(null);
            setNewClassName("");
            setNewStudentCount("");
        }
        bottomSheetRef.current?.snapToIndex(0);
    };

    const closeBottomSheet = () => {
        bottomSheetRef.current?.close();
        setIsEditing(false);
        setSelectedClass(null);
        setNewClassName("");
        setNewStudentCount("");
    };

    const handleSubmit = async () => {
        if (!newClassName || !newStudentCount) return;
        if (isEditing && selectedClass) {
            await updateClass(selectedClass.codClass, newClassName, parseInt(newStudentCount));
        } else {
            await addClass(newClassName, parseInt(newStudentCount));
        }
        const updatedClasses = await getClasses();
        setClasses(updatedClasses);
        closeBottomSheet();
    };

    const handleDelete = (classItem: Classe) => {
        Alert.alert("Delete Class", `Are you sure you want to delete ${classItem.nomClass}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    await deleteClass(classItem.codClass);
                    const updatedClasses = await getClasses();
                    setClasses(updatedClasses);
                },
            },
        ]);
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const renderRightActions = (classItem: Classe) => (
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(classItem)}>
            <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
    );

    return (
        <GestureHandlerRootView style={styles.container}>
            <FlatList
                data={classes}
                renderItem={({ item }) => (
                    <Swipeable renderRightActions={() => renderRightActions(item)}>
                        <List.Item
                            title={item.nomClass}
                            description={`${item.nbreEtud} students`}
                            left={(props) => <List.Icon {...props} icon="google-classroom" />}
                            onPress={() => router.push(`/class/${item.codClass}`)}
                            right={(props) => (
                                <TouchableOpacity onPress={() => openBottomSheet(item)}>
                                    <List.Icon {...props} icon="pencil" />
                                </TouchableOpacity>
                            )}
                        />
                    </Swipeable>
                )}
                keyExtractor={(item) => item.codClass.toString()}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />

            <FAB icon="plus" style={styles.fab} onPress={() => openBottomSheet()} />

            <BottomSheet ref={bottomSheetRef} index={-1} enablePanDownToClose>
                <BottomSheetView style={styles.contentContainer}>
                    <Text variant="headlineMedium" style={styles.title}>
                        {isEditing ? "Edit Class" : "Create New Class"}
                    </Text>
                    <TextInput
                        label="Class Name"
                        value={newClassName}
                        onChangeText={setNewClassName}
                        style={styles.input}
                        mode="outlined"
                    />
                    <TextInput
                        label="Number of Students"
                        value={newStudentCount}
                        onChangeText={setNewStudentCount}
                        keyboardType="numeric"
                        style={styles.input}
                        mode="outlined"
                    />
                    <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                        {isEditing ? "Update Class" : "Create Class"}
                    </Button>
                </BottomSheetView>
            </BottomSheet>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        padding: 24,
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
    },
    title: {
        marginBottom: 20,
        textAlign: "center",
    },
    deleteButton: {
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "flex-end",
        paddingHorizontal: 20,
        marginVertical: 10,
    },
    deleteButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});
