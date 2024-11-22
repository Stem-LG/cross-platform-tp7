import React, { useEffect } from "react";
import { Stack, usePathname, useRouter } from "expo-router";
import { isLoggedIn } from "@/lib/database";
import { Appbar } from "react-native-paper";

export default function RootLayout() {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        isLoggedIn().then((loggedIn) => {
            if (!loggedIn && pathname !== "/login") {
                router.push("/login");
            }
        });
    }, []);

    return (
        <Stack
            screenOptions={{
                header: ({ navigation, route }) => (
                    <Appbar.Header>
                        <Appbar.Content
                            title={pathname === "/" || pathname.startsWith("/class") ? "Classes" : "Subjects"}
                        />
                        <Appbar.Action
                            icon="book"
                            onPress={() => router.push("/matiere")}
                            disabled={pathname.startsWith("/matiere")}
                        />
                        <Appbar.Action
                            icon="google-classroom"
                            onPress={() => router.push("/")}
                            disabled={pathname === "/" || pathname.startsWith("/class")}
                        />
                        <Appbar.Action
                            icon="logout"
                            onPress={() => {
                                router.push("/login");
                            }}
                        />
                    </Appbar.Header>
                ),
            }}
        />
    );
}
