import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

const SPORT_MODE_KEY = "@emps:sport_mode";
const ENDPOINT = "/pacientes/me/modo-monitoramento";

function validarModo(modo) {
  if (modo !== "normal" && modo !== "sport") {
    throw new Error("Modo de monitoramento inválido.");
  }

  return modo;
}

const sportModeService = {
  async obterModoLocal() {
    const valor = await AsyncStorage.getItem(SPORT_MODE_KEY);

    if (valor === null) return null;

    return validarModo(valor);
  },

  async consultarModo() {
    const resposta = await api.get(ENDPOINT);
    const modo = validarModo(resposta.data.modo);

    await AsyncStorage.setItem(SPORT_MODE_KEY, modo);

    return modo;
  },

  async definirModo(modo) {
    validarModo(modo);

    const resposta = await api.patch(ENDPOINT, {
      modo,
    });

    const modoConfirmado = validarModo(resposta.data.modo);

    await AsyncStorage.setItem(
      SPORT_MODE_KEY,
      modoConfirmado
    );

    return modoConfirmado;
  },

  async ativar() {
    return this.definirModo("sport");
  },

  async desativar() {
    return this.definirModo("normal");
  },

  async limparCache() {
    await AsyncStorage.removeItem(SPORT_MODE_KEY);
  },
};

export default sportModeService;
