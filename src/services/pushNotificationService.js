import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import api from "./api";

export async function registrarTokenPush() {
    if (Platform.OS === "web") {
        return null;
    }

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(
            "default",
            {
                name: "Notificações EMPS",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#6C4AB6",
            }
        );
    }

    const permissaoAtual = await Notifications.getPermissionsAsync();

    let status = permissaoAtual.status;

    if (status !== "granted") {
        const permissaoSolicitada = await Notifications.requestPermissionsAsync();
        status = permissaoSolicitada.status;
    }

    if (status !== "granted") {
        console.log(
            "Permissão de notificações não concedida."
        );
        return null;
    }

    const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

    if (!projectId) {
        throw new Error(
            "ID do projeto EAS não encontrado."
        );
    }

    const respostaToken = await Notifications.getExpoPushTokenAsync({
            projectId,
        });

    const expoPushToken = respostaToken.data;

    await api.post("/notificacoes/token", {
        expo_push_token: expoPushToken,
    });

    console.log("Token push registrado no EMPS.");

    return expoPushToken;
}
