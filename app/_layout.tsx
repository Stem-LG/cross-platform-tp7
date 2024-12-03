import { useEffect } from 'react';
import { Stack } from "expo-router";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { useAuthStore } from '../lib/stores/auth';
import { View } from "react-native";

export default function RootLayout() {
    const initialize = useAuthStore(state => state.initialize);
    const isLoading = useAuthStore(state => state.isLoading);

    useEffect(() => {
        initialize();
    }, [initialize]);

    if (isLoading) {
        return <View style={{ flex: 1 }} />;
    }

    return (
        <PaperProvider theme={MD3LightTheme}>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
                <Stack.Screen name="groups" options={{ headerShown: false }} />
                <Stack.Screen name="group/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
            </Stack>
        </PaperProvider>
    );
}
