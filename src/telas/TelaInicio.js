
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
  ArrowRight,
  ShieldCheck,
} from "lucide-react-native";

import AppShell from "../componentes/AppShell";
import Card from "../componentes/Card";
import SectionHeader from "../componentes/SectionHeader";
import StatusBadge from "../componentes/StatusBadge";

import usuarioService from "../services/usuarioService";
import api from "../services/api";
import { registrarTokenPush } from "../services/pushNotificationService";

import { colors } from "../styles/colors";
import { spacing } from "../styles/spacing";

export default function TelaInicio({ tela, setTela }) {
  const [usuario, setUsuario] = useState(null);
  const [monitoramento, setMonitoramento] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const dadosUsuario =
          await usuarioService.buscarUsuarioLogado();

        if (!ativo) return;

        setUsuario(dadosUsuario);

        // O endpoint /usuarios/me pode retornar os dados
        // diretamente ou dentro da propriedade "dados".
        const usuarioLogado =
          dadosUsuario?.dados ?? dadosUsuario;

        const idPaciente = Number(
          usuarioLogado?.id_paciente
        );

        if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
          throw new Error(
            "Não foi possível identificar o paciente logado."
          );
        }

        // Consulta os registros persistidos no Supabase
        // por meio da API do backend Render.
        const resposta = await api.get(
          `/monitoramento/paciente/${idPaciente}`
        );

        if (!ativo) return;

        const retorno = resposta.data;

        const registros = Array.isArray(retorno)
          ? retorno
          : Array.isArray(retorno?.monitoramentos)
            ? retorno.monitoramentos
            : [];

        registros.sort((a, b) => {
          const dataA = new Date(
            a.data_hora ??
            a.data_monitoramento ??
            a.data_registro ??
            a.created_at ??
            0
          ).getTime();

          const dataB = new Date(
            b.data_hora ??
            b.data_monitoramento ??
            b.data_registro ??
            b.created_at ??
            0
          ).getTime();

          return dataB - dataA;
        });

        setMonitoramento(registros[0] ?? null);
      } catch (erroRequisicao) {
        if (!ativo) return;

        console.error(
          "Erro ao carregar a tela inicial:",
          erroRequisicao.response?.data ??
          erroRequisicao.message
        );

        setMonitoramento(null);

        setErro(
          erroRequisicao.response?.status === 401
            ? "Sua sessão expirou. Entre novamente."
            : erroRequisicao.response?.status === 403
              ? "Você não tem permissão para consultar esses dados."
              : erroRequisicao.message?.includes("identificar o paciente")
                ? erroRequisicao.message
                : "Não foi possível carregar os dados do monitoramento."
        );
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    async function registrarNotificacoes() {
      try {
        await registrarTokenPush();
      } catch (erroNotificacao) {
        console.warn(
          "Não foi possível registrar as notificações:",
          erroNotificacao.response?.data ??
          erroNotificacao.message
        );
      }
    }

    carregarDados();
    registrarNotificacoes();

    return () => {
      ativo = false;
    };
  }, []);

  const statusRegistro = String(
    monitoramento?.status ?? ""
  ).toLowerCase();

  const statusBadge = statusRegistro.includes("emerg")
    ? "emergencia"
    : statusRegistro.includes("alert")
      ? "alerta"
      : statusRegistro === "normal"
        ? "normal"
        : null;

  const dataUltimoRegistro =
    monitoramento?.data_hora ??
    monitoramento?.data_monitoramento ??
    monitoramento?.data_registro ??
    monitoramento?.created_at;

  const textoUltimaAtualizacao = dataUltimoRegistro
    ? new Date(dataUltimoRegistro).toLocaleString("pt-BR")
    : "Sem registro de monitoramento";

  const nomeUsuario =
    usuario?.dados?.nome ??
    usuario?.nome ??
    "Paciente";

  return (
    <AppShell
      tela={tela}
      setTela={setTela}
      eyebrow="Seu acompanhamento"
      title={`Olá, ${nomeUsuario.split(" ")[0]}`}
      subtitle="Acompanhe seus indicadores e os registros do monitoramento EMPS."
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
              Status do registro
            </Text>

            <Text style={styles.statusTitle}>
              {carregando
                ? "Carregando..."
                : erro
                  ? "Dados indisponíveis"
                  : monitoramento
                    ? monitoramento.status ?? "Status não informado"
                    : "Sem registros de risco"}
            </Text>

            <Text style={styles.statusDescription}>
              {carregando
                ? "Consultando o banco de dados."
                : erro
                  ? erro
                  : monitoramento
                    ? `Último registro: ${textoUltimaAtualizacao}`
                    : "Não há registros de risco salvos. Isso não confirma o estado atual da saúde."}
            </Text>
          </View>

          {statusBadge ? (
            <StatusBadge status={statusBadge} />
          ) : (
            <Text style={styles.statusDescription}>
              {carregando ? "..." : "Sem dados"}
            </Text>
          )}
        </View>
      </View>

      {/* INDICADORES */}

      <SectionHeader
        icon={Activity}
        title="Resumo do monitoramento"
        subtitle="Dados do último registro disponível"
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
            {carregando
              ? "..."
              : monitoramento?.frequencia_cardiaca ?? "—"}
          </Text>

          <Text style={styles.metricUnit}>
            {monitoramento ? "BPM" : "Sem dados"}
          </Text>

          <Text style={styles.metricLabel}>
            Frequência cardíaca registrada
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
            {carregando
              ? "..."
              : monitoramento?.movimento != null
                ? Number(monitoramento.movimento).toFixed(2)
                : "—"}
          </Text>

          <Text style={styles.metricUnit}>
            {monitoramento?.movimento != null
              ? "Intensidade"
              : "Sem dados"}
          </Text>

          <Text style={styles.metricLabel}>
            Movimento registrado
          </Text>
        </View>
      </View>

      {/* CINTA */}

      <Card>
        <SectionHeader
          icon={Bluetooth}
          title="Cinta EMPS"
          subtitle="Informações do último registro salvo"
        />

        <View style={styles.deviceRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.deviceTitle}>
              Cinta EMPS
            </Text>

            <Text style={styles.deviceSubtitle}>
              {textoUltimaAtualizacao}
            </Text>
          </View>

          <Text style={styles.deviceSubtitle}>
            Conexão não verificada
          </Text>
        </View>

        <View style={styles.separator} />

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.linkButton}
          onPress={() => setTela("cinta")}
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

      {/* SEGURANÇA */}

      <View style={styles.security}>
        <ShieldCheck
          size={15}
          color={colors.success}
        />

        <Text style={styles.securityText}>
          Seus dados são protegidos e armazenados com segurança.
        </Text>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    backgroundColor: colors.primaryDark,
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
    backgroundColor: "rgba(255,255,255,0.15)",
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
    gap: spacing.md,
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
