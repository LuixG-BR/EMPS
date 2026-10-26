import React from "react";
import Toast from "react-native-toast-message";
import * as Notifications from "expo-notifications";

import AppNavigator from "./src/navigation/AppNavigator";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export default function App() {

    return (
        <>
            <AppNavigator />

            <Toast />
        </>
    );
}