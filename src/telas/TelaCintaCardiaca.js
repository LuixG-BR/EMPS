import React, { useState, useEffect } from "react";

import bleService from "../services/bleService";
import monitoramentoService from "../services/monitoramentoService";
import monitoramentoApiService from "../services/monitoramentoApiService";
import usuarioService from "../services/usuarioService";
import sportModeService from "../services/sportModeService";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Bluetooth, BluetoothConnected, BatteryMedium, HeartPulse, Activity, Unplug } from "lucide-react-native";

import AppShell from "../componentes/AppShell";

import { colors } from "../styles/colors";
import { spacing } from "../styles/spacing";

export default function TelaCintaCardiaca({ tela, setTela }) {
  const [idPaciente, setIdPaciente] = useState(null)
  const ID_DISPOSITIVO = 3;

  const [conectado, setConectado] = useState(false);
  const [procurando, setProcurando] = useState(false);

  const [bpm, setBpm] = useState(0);
  const [bateria, setBateria] = useState(0);
  const [movimento, setMovimento] = useState(0);
  const [acelerometro, setAcelerometro] = useState({
    x: 0, y: 0, z: 0
  });
  const [giroscopio, setGiroscopio] = useState({
    x: 0, y: 0, z: 0
  });

  const [dispositivo, setDispositivo] = useState(null);

  const [modoSport, setModoSport] = useState(false);
  const [carregandoSport, setCarregandoSport] = useState(true);
  const [alterandoSport, setAlterandoSport] = useState(false);


  async function carregarModoSport() {
    try {
      setCarregandoSport(true);

      const modo = await sportModeService.consultarModo();

      setModoSport(modo === "sport");

      console.log("Modo consultado na API:", modo);
    } catch (erro) {
      console.log(
        "Erro ao consultar Modo Sport:",
        erro.response?.data || erro.message
      );
    } finally {
      setCarregandoSport(false);
    }
  }

  async function alternarModoSport() {
    if (alterandoSport || carregandoSport) return;

    try {
      setAlterandoSport(true);

      const novoModo = modoSport ? "normal" : "sport";

      const modoConfirmado =
        await sportModeService.definirModo(novoModo);

      setModoSport(modoConfirmado === "sport");

      console.log("Modo atualizado:", modoConfirmado);
    } catch (erro) {
      console.log(
        "Erro ao atualizar Modo Sport:",
        erro.response?.data || erro.message
      );
    } finally {
      setAlterandoSport(false);
    }
  }

  async function procurarCinta() {
    try {
      setProcurando(true);

      console.log("Procurando cinta EMPS...");

      const encontrado = await bleService.procurarCinta();
      console.log("Cinta encontrada:", encontrado.name);

      const dispositivoConectado = await bleService.conectarCinta(encontrado);

      setDispositivo(dispositivoConectado);
      setConectado(true);
      console.log("Cinta EMPS conectada com sucesso.");
      await carregarModoSport();

      bleService.monitorarDados(
        dispositivoConectado,
        (dados) => {
          const resultado = monitoramentoService.adicionarAmostra(
            dados.bpm,
            dados.acelerometro.x,
            dados.acelerometro.y,
            dados.acelerometro.z
          );

          setBpm(dados.bpm);
          setBateria(dados.bateria);
          setMovimento(resultado.movimento);

          setAcelerometro({
            x: dados.acelerometro.x,
            y: dados.acelerometro.y,
            z: dados.acelerometro.z,
          });

          setGiroscopio({
            x: dados.giroscopio.x,
            y: dados.giroscopio.y,
            z: dados.giroscopio.z,
          });
        }
      );
    } catch (erro) {
      console.log("Erro ao conectar cinta:", erro);

      setConectado(false);
    } finally {
      setProcurando(false);
    }
  }

  async function desconectarCinta() {
    try {
      await bleService.desconectarCinta(dispositivo);
    } catch (erro) {
      console.log("Erro ao desconectar:", erro);
    } finally {
      setDispositivo(null);
      setConectado(false);
    }
  }

  useEffect(() => {
    async function carregarPaciente() {
      try {
        const usuario =
          await usuarioService.buscarUsuarioLogado();

        if (
          usuario.tipo !== "paciente" ||
          !usuario.dados?.id_paciente
        ) {
          console.log("Paciente não encontrado no usuário autenticado.");
          return;
        }

        const id = usuario.dados.id_paciente;

        setIdPaciente(id);

        console.log("ID paciente obtido:", id);

      } catch (erro) {
        console.log(
          "Erro ao buscar paciente:",
          erro.response?.data || erro.message
        );
      }
    }

    carregarPaciente();
  }, []);

  useEffect(() => {

    if (!conectado || !idPaciente) {
      return;
    }

    const intervalo = setInterval(
      async () => {

        const medias =
          monitoramentoService
            .calcularMedias();

        if (!medias) {

          console.log(
            "Sem amostras para enviar."
          );

          return;
        }


        console.log(
          "Média calculada:",
          medias
        );


        try {

          const resposta =
            await monitoramentoApiService
              .enviarMedia({
                idPaciente: idPaciente,
                idDispositivo: ID_DISPOSITIVO,
                frequenciaCardiaca: medias.frequencia_cardiaca,
                movimento: medias.movimento,
              });

          console.log("Resultado da análise:", resposta);

          // API recebeu com sucesso.
          monitoramentoService.limparAmostras();
        } catch (erro) {
          console.log(
            "Falha no envio. " +
            "Amostras serão mantidas."
          );
        }
      },

      // TESTE: 10 segundos
      10000
    );

    return () => {
      clearInterval(intervalo);
    };
  }, [conectado, idPaciente]);

  return (
    <AppShell
      tela={tela}
      setTela={setTela}
      title="Cinta cardíaca"
      subtitle="Conecte e gerencie sua cinta EMPS."
    >
      {/* CARD PRINCIPAL */}

      <View style={styles.deviceCard}>
        <View style={styles.deviceTop}>
          <View
            style={[
              styles.bluetoothIcon,
              conectado && styles.bluetoothIconConnected,
            ]}
          >
            {conectado ? (
              <BluetoothConnected
                size={28}
                color={colors.primary}
              />
            ) : (
              <Bluetooth
                size={28}
                color={colors.textMuted}
              />
            )}
          </View>

          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>
              Cinta EMPS
            </Text>

            <Text style={styles.deviceDescription}>
              Dispositivo de monitoramento
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              conectado
                ? styles.statusConnected
                : styles.statusDisconnected,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                conectado
                  ? styles.dotConnected
                  : styles.dotDisconnected,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                conectado
                  ? styles.textConnected
                  : styles.textDisconnected,
              ]}
            >
              {conectado
                ? "Conectada"
                : "Desconectada"}
            </Text>
          </View>
        </View>

        {/* DIVISOR */}

        <View style={styles.divider} />

        {/* INFORMAÇÕES */}

        {conectado ? (
          <View style={styles.deviceDetails}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <BatteryMedium
                  size={21}
                  color={colors.primary}
                />
              </View>

              <View>
                <Text style={styles.detailLabel}>
                  Bateria
                </Text>

                <Text style={styles.detailValue}>
                  {bateria}%
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <HeartPulse
                  size={21}
                  color={colors.primary}
                />
              </View>

              <View>
                <Text style={styles.detailLabel}>
                  Sensor cardíaco
                </Text>

                <Text style={styles.sensorReady}>
                  {bpm > 0 ? `${bpm} BPM` : "Aguardando..."}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Activity
                  size={21}
                  color={colors.primary}
                />
              </View>

              <View>
                <Text style={styles.detailLabel}>
                  Movimento
                </Text>

                <Text style={styles.sensorReady}>
                  {movimento > 0 ? `${movimento.toFixed(2)} m/s²` : "Aguardando..."}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.notConnectedArea}>
            <Bluetooth
              size={32}
              color={colors.textMuted}
            />

            <Text style={styles.notConnectedTitle}>
              Nenhuma cinta conectada
            </Text>

            <Text style={styles.notConnectedText}>
              Conecte sua cinta EMPS para iniciar
              um novo monitoramento.
            </Text>
          </View>
        )}
      </View>

      {/* EXPLICAÇÃO */}

      {/* INFORMAÇÃO */}

      {conectado ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Tudo pronto para começar
          </Text>

          <Text style={styles.infoText}>
            Sua cinta está conectada e os sensores estão
            preparados para iniciar um novo monitoramento.
          </Text>
        </View>
      ) : (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Como funciona?
          </Text>

          <Text style={styles.infoText}>
            Conecte sua cinta EMPS via Bluetooth para
            começar a acompanhar os dados dos sensores.
          </Text>
        </View>
      )}

      {/* BOTÕES */}

      {conectado && (
        <TouchableOpacity
          style={[
            styles.primaryButton,
            (carregandoSport || alterandoSport) &&
            styles.disabledButton,
          ]}
          activeOpacity={0.85}
          onPress={alternarModoSport}
          disabled={carregandoSport || alterandoSport}
        >
          <Activity size={21} color={colors.white} />

          <Text style={styles.primaryButtonText}>
            {carregandoSport
              ? "Carregando Modo Sport..."
              : alterandoSport
                ? "Alterando Modo Sport..."
                : modoSport
                  ? "Desativar Modo Sport"
                  : "Ativar Modo Sport"}
          </Text>
        </TouchableOpacity>
      )}

      {!conectado ? (
        <TouchableOpacity
          style={[
            styles.primaryButton,
            procurando && styles.disabledButton,
          ]}
          activeOpacity={0.85}
          onPress={procurarCinta}
          disabled={procurando}
        >
          <Bluetooth
            size={21}
            color={colors.white}
          />

          <Text style={styles.primaryButtonText}>
            {procurando
              ? "Procurando cinta..."
              : "Procurar cinta"}
          </Text>
        </TouchableOpacity>
      ) : (
        <>

          {/* MODO SPORT */}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (carregandoSport || alterandoSport) &&
              styles.disabledButton,
            ]}
            activeOpacity={0.85}
            onPress={alternarModoSport}
            disabled={carregandoSport || alterandoSport}
          >
            <Activity size={21} color={colors.white} />

            <Text style={styles.primaryButtonText}>
              {carregandoSport
                ? "Consultando modo..."
                : alterandoSport
                  ? "Atualizando modo..."
                  : modoSport
                    ? "Desativar Modo Sport"
                    : "Ativar Modo Sport"}
            </Text>
          </TouchableOpacity>

          {/* ENCERRAR MONITORAMENTO */}

          <TouchableOpacity
            style={styles.disconnectButton}
            activeOpacity={0.8}
            onPress={desconectarCinta}
          >
            <Unplug
              size={18}
              color={colors.textSecondary}
            />

            <Text style={styles.disconnectButtonText}>
              Encerrar monitoramento
            </Text>
          </TouchableOpacity>
        </>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  /* CARD PRINCIPAL */

  deviceCard: {
    backgroundColor: colors.surface,
    borderRadius: 26,

    padding: spacing.xl,

    marginBottom: spacing.lg,

    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 18,

    elevation: 4,
  },

  deviceTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  bluetoothIcon: {
    width: 58,
    height: 58,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 18,

    backgroundColor: colors.background,

    borderWidth: 1,
    borderColor: colors.border,
  },

  bluetoothIconConnected: {
    backgroundColor: "#F2EEFF",
    borderColor: "#DED5FF",
  },

  deviceInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  deviceName: {
    fontSize: 17,
    fontWeight: "800",

    color: colors.textPrimary,
  },

  deviceDescription: {
    marginTop: 4,

    fontSize: 11,

    color: colors.textMuted,
  },

  /* STATUS */

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 10,
    paddingVertical: 7,

    borderRadius: 20,
  },

  statusConnected: {
    backgroundColor: "#EAF8F0",
  },

  statusDisconnected: {
    backgroundColor: "#F2F2F4",
  },

  statusDot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    marginRight: 6,
  },

  dotConnected: {
    backgroundColor: colors.success,
  },

  dotDisconnected: {
    backgroundColor: colors.textMuted,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",

    letterSpacing: 0.2,
  },

  textConnected: {
    color: colors.success,
  },

  textDisconnected: {
    color: colors.textMuted,
  },

  /* DIVISOR */

  divider: {
    height: 1,

    backgroundColor: colors.border,

    marginVertical: spacing.xl,
  },

  /* DETALHES DA CINTA */

  deviceDetails: {
    gap: spacing.sm,
  },

  detailItem: {
    minHeight: 62,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: spacing.md,

    borderRadius: 16,

    backgroundColor: colors.background,
  },

  detailIcon: {
    width: 40,
    height: 40,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 13,

    backgroundColor: colors.surface,

    marginRight: spacing.md,

    borderWidth: 1,
    borderColor: colors.border,
  },

  detailLabel: {
    fontSize: 11,

    color: colors.textMuted,
  },

  detailValue: {
    marginTop: 2,

    fontSize: 15,
    fontWeight: "800",

    color: colors.textPrimary,
  },

  sensorReady: {
    marginTop: 2,

    fontSize: 14,
    fontWeight: "700",

    color: colors.success,
  },

  /* SEM CONEXÃO */

  notConnectedArea: {
    alignItems: "center",

    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },

  notConnectedTitle: {
    marginTop: spacing.lg,

    fontSize: 16,
    fontWeight: "800",

    color: colors.textPrimary,
  },

  notConnectedText: {
    marginTop: spacing.sm,

    maxWidth: 260,

    textAlign: "center",

    fontSize: 12,
    lineHeight: 19,

    color: colors.textMuted,
  },

  /* CARD DE INFORMAÇÃO */

  infoCard: {
    padding: spacing.lg,

    backgroundColor: "#F5F2FF",

    borderWidth: 1,
    borderColor: "#E7E0FF",

    borderRadius: 20,

    marginBottom: spacing.xl,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "800",

    color: colors.primary,
  },

  infoText: {
    marginTop: 6,

    fontSize: 12,
    lineHeight: 19,

    color: colors.textSecondary,
  },

  /* BOTÃO PRINCIPAL */

  primaryButton: {
    height: 60,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.primary,

    borderRadius: 19,

    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,

    elevation: 5,
  },

  primaryButtonText: {
    marginLeft: spacing.sm,

    fontSize: 15,
    fontWeight: "800",

    letterSpacing: 0.2,

    color: colors.white,
  },

  disabledButton: {
    opacity: 0.55,
  },

  /* DESCONECTAR */

  disconnectButton: {
    height: 52,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginTop: spacing.md,
    marginBottom: spacing.xxl,

    borderRadius: 16,

    backgroundColor: "transparent",
  },

  disconnectButtonText: {
    marginLeft: spacing.sm,

    fontSize: 13,
    fontWeight: "600",

    color: colors.textMuted,
  },
});