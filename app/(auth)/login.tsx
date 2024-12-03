import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Button, TextInput, Text, Appbar } from "react-native-paper";
import { Link, router } from "expo-router";
import { useAuthStore } from "../../lib/stores/auth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { signIn, user } = useAuthStore();

    useEffect(() => {
        // Redirect to home if already logged in
        if (user) {
            router.replace('/groups');
        }
    }, [user]);

    const handleLogin = async () => {
        try {
            setLoading(true);
            await signIn(email, password);
            router.replace("/groups");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.Content title="Login" />
            </Appbar.Header>
            <View style={styles.content}>
                <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={styles.input} />
                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                />
                <Button mode="contained" onPress={handleLogin} loading={loading} style={styles.button}>
                    Login
                </Button>
                <Link href="/(auth)/register" asChild>
                    <Button mode="text">Register</Button>
                </Link>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 16,
        justifyContent: "center",
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginBottom: 8,
    },
});
