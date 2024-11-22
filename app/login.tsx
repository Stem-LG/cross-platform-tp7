import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput, Button, Text, Surface, HelperText } from "react-native-paper";
import { useRouter } from "expo-router";
import { login } from "@/lib/database";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loginError, setLoginError] = useState("");
    const router = useRouter();

    const validateForm = () => {
        let isValid = true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Email validation
        if (!email) {
            setEmailError("Email is required");
            isValid = false;
        } else if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address");
            isValid = false;
        } else {
            setEmailError("");
        }

        // Password validation
        if (!password) {
            setPasswordError("Password is required");
            isValid = false;
        } else if (password.length < 3) {
            setPasswordError("Password must be at least 6 characters");
            isValid = false;
        } else {
            setPasswordError("");
        }

        return isValid;
    };

    const handleLogin = async () => {
        setLoginError(""); // Clear previous error
        if (validateForm()) {
            try {
                const success = await login(email, password);
                if (success) {
                    router.push("/");
                } else {
                    setLoginError("Invalid email or password");
                }
            } catch (error: any) {
                console.log(error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Surface style={styles.surface} elevation={2}>
                <Text variant="headlineLarge" style={styles.title}>
                    Login
                </Text>

                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        setEmailError("");
                    }}
                    mode="outlined"
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={!!emailError}
                />
                <HelperText type="error" visible={!!emailError}>
                    {emailError}
                </HelperText>

                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        setPasswordError("");
                    }}
                    mode="outlined"
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    error={!!passwordError}
                    right={
                        <TextInput.Icon
                            icon={showPassword ? "eye-off" : "eye"}
                            onPress={() => setShowPassword(!showPassword)}
                        />
                    }
                />
                <HelperText type="error" visible={!!passwordError}>
                    {passwordError}
                </HelperText>

                <HelperText type="error" visible={!!loginError} style={styles.errorText}>
                    {loginError}
                </HelperText>

                <Button mode="contained" onPress={handleLogin} style={styles.button}>
                    Login
                </Button>
            </Surface>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: "center",
    },
    surface: {
        padding: 20,
        borderRadius: 10,
    },
    title: {
        textAlign: "center",
        marginBottom: 24,
    },
    input: {
        marginBottom: 4,
    },
    button: {
        marginTop: 16,
    },
    errorText: {
        textAlign: "center",
        marginTop: 8,
    },
});
