import React, { useState, useRef, useEffect } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import { List, FAB, TextInput, Button, Text } from "react-native-paper";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { useLocalSearchParams } from "expo-router";

import { Student, Classe, Matiere } from "../../lib/types";
import { getStudentsByClass, addStudent, updateStudent, deleteStudent, getClassById } from "../../lib/database";
import { getMatieres, addMatiereToClass, removeMatiereFromClass } from "../../lib/database";

export default function ClassPage() {
    const { codClass } = useLocalSearchParams();
    const classId = Number(codClass);

    const bottomSheetRef = useRef<BottomSheet>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [classInfo, setClassInfo] = useState<Classe | null>(null);
    const [matieres, setMatieres] = useState<Matiere[]>([]);

    const [newStudentFirstName, setNewStudentFirstName] = useState("");
    const [newStudentLastName, setNewStudentLastName] = useState("");
    const [newStudentBirthDate, setNewStudentBirthDate] = useState("");

    const [allMatieres, setAllMatieres] = useState<Matiere[]>([]);
    const [selectedMatiereId, setSelectedMatiereId] = useState<number | null>(null);
    const [isAddingMatiere, setIsAddingMatiere] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        initializeData();
    }, [classId]);

    const initializeData = async () => {
        const [fetchedClass, fetchedStudents] = await Promise.all([getClassById(classId), getStudentsByClass(classId)]);
        setClassInfo(fetchedClass);
        setStudents(fetchedStudents);
        setMatieres(fetchedClass?.matieres || []);
    };

    const fetchAllMatieres = async () => {
        const fetchedMatieres = await getMatieres();
        setAllMatieres(fetchedMatieres);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        const fetchedStudents = await getStudentsByClass(classId);
        setStudents(fetchedStudents);
        setRefreshing(false);
    };

    const openBottomSheet = (studentItem?: Student) => {
        if (studentItem) {
            setIsEditing(true);
            setSelectedStudent(studentItem);
            setNewStudentFirstName(studentItem.prenom);
            setNewStudentLastName(studentItem.nom);
            setNewStudentBirthDate(studentItem.dateNais);
        } else {
            setIsEditing(false);
            setSelectedStudent(null);
            setNewStudentFirstName("");
            setNewStudentLastName("");
            setNewStudentBirthDate("");
        }
        bottomSheetRef.current?.snapToIndex(0);
    };

    const closeBottomSheet = () => {
        bottomSheetRef.current?.close();
        setIsEditing(false);
        setSelectedStudent(null);
        setNewStudentFirstName("");
        setNewStudentLastName("");
        setNewStudentBirthDate("");
    };

    const handleSubmit = async () => {
        if (!newStudentFirstName || !newStudentLastName || !newStudentBirthDate) return;
        if (isEditing && selectedStudent) {
            await updateStudent(
                selectedStudent.id,
                classId,
                newStudentLastName,
                newStudentFirstName,
                newStudentBirthDate
            );
        } else {
            await addStudent(classId, newStudentLastName, newStudentFirstName, newStudentBirthDate);
        }
        const updatedStudents = await getStudentsByClass(classId);
        setStudents(updatedStudents);
        closeBottomSheet();
    };

    const handleDelete = (studentItem: Student) => {
        Alert.alert("Delete Student", `Are you sure you want to delete ${studentItem.prenom} ${studentItem.nom}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    await deleteStudent(studentItem.id);
                    const updatedStudents = await getStudentsByClass(classId);
                    setStudents(updatedStudents);
                },
            },
        ]);
    };

    const renderRightActions = (studentItem: Student) => (
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(studentItem)}>
            <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
    );

    const renderMatiereRightActions = (matiere: Matiere) => (
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteMatiere(matiere)}>
            <Text style={styles.deleteButtonText}>Remove</Text>
        </TouchableOpacity>
    );

    const openMatiereBottomSheet = async () => {
        await fetchAllMatieres();
        setIsAddingMatiere(true);
        setSelectedMatiereId(null);
        bottomSheetRef.current?.snapToIndex(0);
    };

    const handleAddMatiere = async () => {
        if (!selectedMatiereId) return;
        await addMatiereToClass(classId, selectedMatiereId);
        await initializeData();
        bottomSheetRef.current?.close();
        setIsAddingMatiere(false);
    };

    const handleDeleteMatiere = async (matiere: Matiere) => {
        await removeMatiereFromClass(classId, matiere.codMat);
        await initializeData();
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <Text style={styles.classTitle}>{classInfo ? `Students in ${classInfo.nomClass}` : "Loading..."}</Text>

            {/* Existing Students FlatList */}
            <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>Students</Text>
                <FlatList
                    data={students}
                    renderItem={({ item }) => (
                        <Swipeable renderRightActions={() => renderRightActions(item)}>
                            <List.Item
                                title={`${item.prenom} ${item.nom}`}
                                description={`Birthdate: ${item.dateNais && item.dateNais.slice(0, 10)}`}
                                left={(props) => <List.Icon {...props} icon="account" />}
                                right={(props) => (
                                    <TouchableOpacity onPress={() => openBottomSheet(item)}>
                                        <List.Icon {...props} icon="pencil" />
                                    </TouchableOpacity>
                                )}
                            />
                        </Swipeable>
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            </View>

            {/* New Subjects FlatList */}
            <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>Subjects</Text>
                <FlatList
                    data={matieres}
                    renderItem={({ item }) => (
                        <Swipeable renderRightActions={() => renderMatiereRightActions(item)}>
                            <List.Item
                                title={item.intMat}
                                description={item.description}
                                left={(props) => <List.Icon {...props} icon="book" />}
                            />
                        </Swipeable>
                    )}
                    keyExtractor={(item) => item.codMat.toString()}
                />
            </View>

            <FAB
                icon="plus"
                style={styles.studentFab}
                onPress={() => {
                    setIsAddingMatiere(false);
                    openBottomSheet();
                }}
            />
            <FAB icon="book-plus" style={styles.matiereFab} onPress={openMatiereBottomSheet} />

            <BottomSheet ref={bottomSheetRef} index={-1} enablePanDownToClose>
                <BottomSheetView style={styles.contentContainer}>
                    {!isAddingMatiere ? (
                        // Existing student form
                        <>
                            <Text variant="headlineMedium" style={styles.title}>
                                {isEditing ? "Edit Student" : "Add New Student"}
                            </Text>
                            <TextInput
                                label="First Name"
                                value={newStudentFirstName}
                                onChangeText={setNewStudentFirstName}
                                style={styles.input}
                                mode="outlined"
                            />
                            <TextInput
                                label="Last Name"
                                value={newStudentLastName}
                                onChangeText={setNewStudentLastName}
                                style={styles.input}
                                mode="outlined"
                            />
                            <TextInput
                                label="Birth Date"
                                value={newStudentBirthDate}
                                onChangeText={setNewStudentBirthDate}
                                style={styles.input}
                                mode="outlined"
                            />
                            <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                                {isEditing ? "Update Student" : "Add Student"}
                            </Button>
                        </>
                    ) : (
                        // New subject selection form
                        <>
                            <Text variant="headlineMedium" style={styles.title}>
                                Add Subject to Class
                            </Text>
                            <View style={styles.selectContainer}>
                                {allMatieres.map((matiere) => (
                                    <Button
                                        key={matiere.codMat}
                                        mode={selectedMatiereId === matiere.codMat ? "contained" : "outlined"}
                                        onPress={() => setSelectedMatiereId(matiere.codMat)}
                                        style={styles.selectButton}
                                    >
                                        {matiere.intMat}
                                    </Button>
                                ))}
                            </View>
                            <Button
                                mode="contained"
                                onPress={handleAddMatiere}
                                style={styles.button}
                                disabled={!selectedMatiereId}
                            >
                                Add Subject
                            </Button>
                        </>
                    )}
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
    studentFab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 80,
    },
    matiereFab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
    },
    container: {
        flex: 1,
        paddingBottom: 80, // Add space for FAB
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
    classTitle: {
        fontSize: 24,
        fontWeight: "bold",
        margin: 16,
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
    listContainer: {
        flex: 1,
        marginHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 8,
    },
    selectContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    selectButton: {
        margin: 4,
    },
});
