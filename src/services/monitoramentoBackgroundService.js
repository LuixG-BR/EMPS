import { Platform, PermissionsAndroid } from "react-native";
import BackgroundService from "react-native-background-actions";
import monitoramentoService from "./monitoramentoService";
import monitoramentoApiService from "./monitoramentoApiService";

const INTERVALO_ENVIO = 10000;
let pacienteAtivo = null;
let dispositivoAtivo = null;
let iniciando = false;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function tarefaMonitoramento() {
  console.log("Serviço persistente de monitoramento iniciado.");

  while (BackgroundService.isRunning()) {
    await esperar(INTERVALO_ENVIO);

    if (!BackgroundService.isRunning()) break;
    if (!pacienteAtivo || !dispositivoAtivo) continue;

    const medias = monitoramentoService.calcularMedias();
    if (!medias) continue;

    try {
      const resposta = await monitoramentoApiService.enviarMedia({
        idPaciente: pacienteAtivo,
        idDispositivo: dispositivoAtivo,
        frequenciaCardiaca: medias.frequencia_cardiaca,
        movimento: medias.movimento,
      });

      console.log("Resultado da análise em segundo plano:", resposta);
      monitoramentoService.limparAmostras();
    } catch (erro) {
      console.log(
        "Falha no envio em segundo plano; as amostras foram preservadas.",
        erro.response?.data || erro.message
      );
    }
  }

  console.log("Serviço persistente de monitoramento encerrado.");
}

const opcoesNotificacao = {
  taskName: "EMPSMonitoramento",
  taskTitle: "EMPS — Monitoramento ativo",
  taskDesc: "Recebendo dados da cinta cardíaca conectada.",
  taskIcon: { name: "ic_launcher", type: "mipmap" },
  color: "#5630A6",
  linkingURI: "emps://cinta",
  parameters: {},
};

const monitoramentoBackgroundService = {
  async iniciar({ idPaciente, idDispositivo }) {
    if (Platform.OS !== "android") {
      throw new Error("O serviço persistente foi configurado para Android.");
    }
    if (!idPaciente || !idDispositivo) {
      throw new Error("Paciente e dispositivo são obrigatórios para iniciar o monitoramento.");
    }

    pacienteAtivo = idPaciente;
    dispositivoAtivo = idDispositivo;

    if (Platform.Version >= 33) {
      const resultado = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (resultado !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Permissão de notificações negada; o Android poderá limitar a visibilidade da notificação do serviço.");
      }
    }

    if (BackgroundService.isRunning() || iniciando) return;

    iniciando = true;
    try {
      await BackgroundService.start(tarefaMonitoramento, opcoesNotificacao);
    } finally {
      iniciando = false;
    }
  },

  async parar() {
    pacienteAtivo = null;
    dispositivoAtivo = null;
    if (BackgroundService.isRunning()) {
      await BackgroundService.stop();
    }
  },

  estaAtivo() {
    return BackgroundService.isRunning();
  },
};

export default monitoramentoBackgroundService;
