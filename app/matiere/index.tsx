import React, { useState, useRef, useEffect } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import { List, FAB, TextInput, Button, Text, Appbar } from "react-native-paper";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";

import { Matiere } from "@/lib/types";
import { getMatieres, addMatiere, updateMatiere, deleteMatiere } from "@/lib/database";

export default function MatierePage() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [newMatiereTitle, setNewMatiereTitle] = useState("");
  const [newMatiereDescription, setNewMatiereDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState<Matiere | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeMatieres();
  }, []);

  const initializeMatieres = async () => {
    const fetchedMatieres = await getMatieres();
    setMatieres(fetchedMatieres);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeMatieres();
    setRefreshing(false);
  };

  const openBottomSheet = (matiereItem?: Matiere) => {
    if (matiereItem) {
      setIsEditing(true);
      setSelectedMatiere(matiereItem);
      setNewMatiereTitle(matiereItem.intMat);
      setNewMatiereDescription(matiereItem.description);
    } else {
      setIsEditing(false);
      setSelectedMatiere(null);
      setNewMatiereTitle("");
      setNewMatiereDescription("");
    }
    bottomSheetRef.current?.snapToIndex(0);
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current?.close();
    setIsEditing(false);
    setSelectedMatiere(null);
    setNewMatiereTitle("");
    setNewMatiereDescription("");
  };

  const handleSubmit = async () => {
    if (!newMatiereTitle || !newMatiereDescription) return;

    if (isEditing && selectedMatiere) {
      await updateMatiere(selectedMatiere.codMat, newMatiereTitle, newMatiereDescription);
    } else {
      await addMatiere(newMatiereTitle, newMatiereDescription);
    }

    await initializeMatieres();
    closeBottomSheet();
  };

  const handleDelete = (matiereItem: Matiere) => {
    Alert.alert(
      "Delete Subject",
      `Are you sure you want to delete ${matiereItem.intMat}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteMatiere(matiereItem.codMat);
            await initializeMatieres();
          },
        },
      ]
    );
  };

  const renderRightActions = (matiereItem: Matiere) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => handleDelete(matiereItem)}
    >
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Subjects" />
      </Appbar.Header>

      <FlatList
        data={matieres}
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item)}>
            <List.Item
              title={item.intMat}
              description={item.description}
              left={(props) => <List.Icon {...props} icon="book" />}
              right={(props) => (
                <TouchableOpacity onPress={() => openBottomSheet(item)}>
                  <List.Icon {...props} icon="pencil" />
                </TouchableOpacity>
              )}
            />
          </Swipeable>
        )}
        keyExtractor={(item) => item.codMat.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      <FAB icon="plus" style={styles.fab} onPress={() => openBottomSheet()} />

      <BottomSheet ref={bottomSheetRef} index={-1} enablePanDownToClose>
        <BottomSheetView style={styles.contentContainer}>
          <Text variant="headlineMedium" style={styles.title}>
            {isEditing ? "Edit Subject" : "Create New Subject"}
          </Text>
          <TextInput
            label="Subject Title"
            value={newMatiereTitle}
            onChangeText={setNewMatiereTitle}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Description"
            value={newMatiereDescription}
            onChangeText={setNewMatiereDescription}
            style={styles.input}
            mode="outlined"
          />
          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            {isEditing ? "Update Subject" : "Create Subject"}
          </Button>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
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
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
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