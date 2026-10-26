import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import api from "./api";

export async function registrarTokenPush() {
  try {
    console.log("[PUSH] Iniciando registro.");

    if (Platform.OS === "web") {
      console.log("[PUSH] Plataforma web. Registro ignorado.");
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Notificações EMPS",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#6C4AB6",
      });

      console.log("[PUSH] Canal Android configurado.");
    }

    const permissaoAtual =
      await Notifications.getPermissionsAsync();

    let status = permissaoAtual.status;

    console.log("[PUSH] Permissão atual:", status);

    if (status !== "granted") {
      const permissaoSolicitada =
        await Notifications.requestPermissionsAsync();

      status = permissaoSolicitada.status;

      console.log("[PUSH] Permissão solicitada:", status);
    }

    if (status !== "granted") {
      console.warn("[PUSH] Permissão não concedida.");
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      throw new Error("ID do projeto EAS não encontrado.");
    }

    console.log("[PUSH] ID do projeto EAS encontrado.");

    const respostaToken =
      await Notifications.getExpoPushTokenAsync({ projectId });

    const expoPushToken = respostaToken.data;

    console.log(
      "[PUSH] Token Expo gerado:",
      Boolean(expoPushToken)
    );

    const resposta = await api.post("/notificacoes/token", {
      expo_push_token: expoPushToken,
    });

    console.log(
      "[PUSH] Backend respondeu:",
      resposta.status,
      resposta.data
    );

    return expoPushToken;
  } catch (erro) {
    console.error("[PUSH] Falha no registro:", {
      mensagem: erro.message,
      status: erro.response?.status,
      resposta: erro.response?.data,
    });

    throw erro;
  }
}