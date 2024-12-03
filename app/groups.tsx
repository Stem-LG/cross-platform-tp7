import { useState, useRef } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Appbar, List, IconButton, Portal, Modal, TextInput, Button } from "react-native-paper";
import { useGroups } from "../lib/hooks/useGroups";
import { router } from "expo-router";
import { Group } from "../lib/types";
import { useAuthStore } from "@/lib/stores/auth";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";

export default function Groups() {
    const { groups, loading, createGroup, updateGroup, deleteGroup } = useGroups();
    const { signOut } = useAuthStore();
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">("create");

    const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

    const handleCreateGroup = async () => {
        try {
            await createGroup(groupName);
            setModalVisible(false);
            setGroupName("");
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateGroup = async () => {
        if (!selectedGroup) return;
        try {
            await updateGroup(selectedGroup.id, groupName);
            setModalVisible(false);
            setGroupName("");
            setSelectedGroup(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteGroup = async () => {
        if (!selectedGroup) return;
        try {
            await deleteGroup(selectedGroup.id);
            setModalVisible(false);
            setSelectedGroup(null);
        } catch (error) {
            console.error(error);
        }
    };

    const openCreateModal = () => {
        setModalMode("create");
        setGroupName("");
        setModalVisible(true);
    };

    const openEditModal = (group: Group) => {
        setModalMode("edit");
        setSelectedGroup(group);
        setGroupName(group.name);
        setModalVisible(true);
    };

    const openDeleteModal = (group: Group) => {
        setModalMode("delete");
        setSelectedGroup(group);
        setModalVisible(true);
    };

    const renderRightActions = (group: Group, deleteAction: () => void) => {
        return (
            <View style={styles.swipeDeleteContainer}>
                <Button mode="contained" onPress={deleteAction} textColor="red" buttonColor="transparent" style={styles.swipeDeleteButton}>
                    Delete
                </Button>
            </View>
        );
    };

    const renderItem = ({ item }: { item: Group }) => {
        const handleDelete = () => {
            swipeableRefs.current[item.id]?.close();
            openDeleteModal(item);
        };

        return (
            <Swipeable
                ref={(ref) => (swipeableRefs.current[item.id] = ref)}
                renderRightActions={() => renderRightActions(item, handleDelete)}
                rightThreshold={40}
            >
                <List.Item
                    title={item.name}
                    right={() => (
                        <View style={styles.actions}>
                            <IconButton icon="pencil" onPress={() => openEditModal(item)} />
                        </View>
                    )}
                    onPress={() => router.push(`/group/${item.id}`)}
                />
            </Swipeable>
        );
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.container}>
                <Appbar.Header>
                    <Appbar.Content title={"Groups"} />
                    <Appbar.Action icon="plus" onPress={openCreateModal} />
                    <Appbar.Action icon="logout" onPress={signOut} />
                </Appbar.Header>

                <FlatList
                    data={groups}
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
                                <TextInput
                                    label="Group Name"
                                    value={selectedGroup?.name}
                                    disabled
                                    style={styles.input}
                                />
                                <Button mode="contained" onPress={handleDeleteGroup} style={styles.button}>
                                    Delete Group
                                </Button>
                                <Button mode="outlined" onPress={() => setModalVisible(false)}>
                                    Cancel
                                </Button>
                            </View>
                        ) : (
                            <View>
                                <TextInput
                                    label="Group Name"
                                    value={groupName}
                                    onChangeText={setGroupName}
                                    style={styles.input}
                                />
                                <Button
                                    mode="contained"
                                    onPress={modalMode === "create" ? handleCreateGroup : handleUpdateGroup}
                                    style={styles.button}
                                >
                                    {modalMode === "create" ? "Create Group" : "Update Group"}
                                </Button>
                                <Button mode="outlined" onPress={() => setModalVisible(false)}>
                                    Cancel
                                </Button>
                            </View>
                        )}
                    </Modal>
                </Portal>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    actions: {
        flexDirection: "row",
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
    swipeDeleteContainer: {
        width: 100,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    swipeDeleteButton: {
        height: "80%",
        justifyContent: "center",
    },
});
