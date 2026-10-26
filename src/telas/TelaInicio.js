import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import {
  HeartPulse,
  Activity,
  Bluetooth,
  Pill,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react-native";

import AppShell from "../componentes/AppShell";
import Card from "../componentes/Card";
import SectionHeader from "../componentes/SectionHeader";
import StatusBadge from "../componentes/StatusBadge";
import PrimaryButton from "../componentes/PrimaryButton";

import usuarioService from "../services/usuarioService";
import { registrarTokenPush } from "../services/pushNotificationService";

import { colors } from "../styles/colors";
import { spacing } from "../styles/spacing";

export default function TelaInicio({
  tela,
  setTela,
}) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const dados =
          await usuarioService.buscarUsuarioLogado();

        setUsuario(dados);
      } catch (erro) {
        console.error(
          "Erro ao carregar usuário:",
          erro
        );
      }
    }

    async function registrarNotificacoes() {
      try {
        await registrarTokenPush();
      } catch (erro) {
        console.warn(
          "Não foi possível registrar o token push:",
          erro.response?.data || erro.message
        );
      }
    }

    carregarUsuario();
    registrarNotificacoes();
  }, []);

  return (
    <AppShell
      tela={tela}
      setTela={setTela}
      eyebrow="Seu acompanhamento"
      title={`Olá, ${usuario?.nome?.split(" ")[0] || "Paciente"
        }`}
      subtitle="Acompanhe seus principais indicadores de saúde e o status da sua cinta EMPS."
    >
      {/* STATUS PRINCIPAL */}

      <View style={styles.statusCard}>
        <View style={styles.statusTop}>
          <View style={styles.heartContainer}>
            <HeartPulse
              size={30}
              color={colors.white}
            />
          </View>

          <View style={styles.statusText}>
            <Text style={styles.statusLabel}>
              Status atual
            </Text>

            <Text style={styles.statusTitle}>
              Tudo está normal
            </Text>

            <Text style={styles.statusDescription}>
              Nenhuma alteração importante
              detectada recentemente.
            </Text>
          </View>

          <StatusBadge
            status="normal"
          />
        </View>
      </View>

      {/* INDICADORES */}

      <SectionHeader
        icon={Activity}
        title="Resumo de hoje"
        subtitle="Principais indicadores do monitoramento"
      />

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <HeartPulse
              size={21}
              color={colors.danger}
            />
          </View>

          <Text style={styles.metricValue}>
            78
          </Text>

          <Text style={styles.metricUnit}>
            BPM
          </Text>

          <Text style={styles.metricLabel}>
            Frequência cardíaca
          </Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Activity
              size={21}
              color={colors.primary}
            />
          </View>

          <Text style={styles.metricValue}>
            Normal
          </Text>

          <Text style={styles.metricUnit}>
            movimento
          </Text>

          <Text style={styles.metricLabel}>
            Atividade corporal
          </Text>
        </View>
      </View>

      {/* CINTA */}

      <Card>
        <SectionHeader
          icon={Bluetooth}
          title="Cinta EMPS"
          subtitle="Status do dispositivo conectado"
        />

        <View style={styles.deviceRow}>
          <View>
            <Text style={styles.deviceTitle}>
              EMPS Wearable
            </Text>

            <Text style={styles.deviceSubtitle}>
              Última sincronização agora
            </Text>
          </View>

          <StatusBadge
            status="conectado"
          />
        </View>

        <View style={styles.separator} />

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.linkButton}
          onPress={() =>
            setTela("cinta")
          }
        >
          <Text style={styles.linkText}>
            Ver detalhes da cinta
          </Text>

          <ArrowRight
            size={18}
            color={colors.primary}
          />
        </TouchableOpacity>
      </Card>

      {/* MEDICAÇÕES */}



      {/* SEGURANÇA */}

      <View style={styles.security}>
        <ShieldCheck
          size={15}
          color={colors.success}
        />

        <Text style={styles.securityText}>
          Seus dados são protegidos e
          armazenados com segurança.
        </Text>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    backgroundColor:
      colors.primaryDark,

    borderRadius: 22,

    padding: spacing.lg,

    marginBottom: spacing.xxl,

    shadowColor: colors.primary,
    shadowOpacity: 0.16,
    shadowRadius: 14,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 5,
  },

  statusTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  heartContainer: {
    width: 56,
    height: 56,

    borderRadius: 18,

    backgroundColor:
      "rgba(255,255,255,0.15)",

    alignItems: "center",
    justifyContent: "center",

    marginRight: spacing.md,
  },

  statusText: {
    flex: 1,
  },

  statusLabel: {
    color: colors.pink,
    fontSize: 10,
    fontWeight: "700",
  },

  statusTitle: {
    color: colors.white,

    fontSize: 17,

    fontWeight: "900",

    marginTop: 2,
  },

  statusDescription: {
    color: "#DDD1F1",

    fontSize: 10,

    lineHeight: 15,

    marginTop: 4,

    maxWidth: 190,
  },

  metricsRow: {
    flexDirection: "row",

    gap: spacing.md,

    marginBottom: spacing.xxl,
  },

  metricCard: {
    flex: 1,

    minHeight: 150,

    backgroundColor: colors.white,

    borderRadius: 20,

    padding: spacing.lg,

    borderWidth: 1,

    borderColor: colors.border,

    shadowColor: colors.primary,
    shadowOpacity: 0.05,
    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 2,
  },

  metricIcon: {
    width: 40,
    height: 40,

    borderRadius: 13,

    backgroundColor: colors.soft,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: spacing.md,
  },

  metricValue: {
    color: colors.textPrimary,

    fontSize: 20,

    fontWeight: "900",
  },

  metricUnit: {
    color: colors.textSecondary,

    fontSize: 9,

    marginTop: 1,
  },

  metricLabel: {
    color: colors.textMuted,

    fontSize: 10,

    lineHeight: 15,

    marginTop: spacing.sm,
  },

  deviceRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  deviceTitle: {
    color: colors.textPrimary,

    fontSize: 14,

    fontWeight: "800",
  },

  deviceSubtitle: {
    color: colors.textSecondary,

    fontSize: 10,

    marginTop: 4,
  },

  separator: {
    height: 1,

    backgroundColor: colors.border,

    marginVertical: spacing.lg,
  },

  linkButton: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-between",
  },

  linkText: {
    color: colors.primary,

    fontSize: 12,

    fontWeight: "800",
  },

  medicineContent: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: spacing.lg,
  },

  medicineName: {
    color: colors.textPrimary,

    fontSize: 15,

    fontWeight: "800",
  },

  medicineDose: {
    color: colors.textSecondary,

    fontSize: 11,

    marginTop: 3,
  },

  timeBox: {
    backgroundColor: colors.soft,

    borderRadius: 14,

    paddingHorizontal: 16,

    paddingVertical: 10,

    alignItems: "center",
  },

  time: {
    color: colors.primary,

    fontSize: 16,

    fontWeight: "900",
  },

  timeLabel: {
    color: colors.textSecondary,

    fontSize: 9,

    marginTop: 2,
  },

  emergencyCard: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor:
      colors.dangerBackground,

    borderRadius: 18,

    padding: spacing.lg,

    marginTop: spacing.sm,

    marginBottom: spacing.md,

    borderWidth: 1,

    borderColor: "#F7D5DB",
  },

  emergencyIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: colors.white,

    alignItems: "center",
    justifyContent: "center",

    marginRight: spacing.md,
  },

  emergencyText: {
    flex: 1,
  },

  emergencyTitle: {
    color: colors.danger,

    fontSize: 14,

    fontWeight: "900",
  },

  emergencyDescription: {
    color: colors.textSecondary,

    fontSize: 10,

    lineHeight: 15,

    marginTop: 3,
  },

  security: {
    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    marginTop: spacing.xl,
  },

  securityText: {
    color: colors.textMuted,

    fontSize: 9,

    marginLeft: 6,
  },
});