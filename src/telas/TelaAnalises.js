
import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import {
  BarChart3,
  TrendingUp,
  Clock3,
  PieChart,
} from "lucide-react-native";

import AppShell from "../componentes/AppShell";
import Card from "../componentes/Card";
import SectionHeader from "../componentes/SectionHeader";

import { colors } from "../styles/colors";
import { spacing } from "../styles/spacing";

import relatorioService from "../services/relatorioService";
import usuarioService from "../services/usuarioService";

export default function TelaAnalises({ tela, setTela }) {
  const [relatorio, setRelatorio] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;

    async function carregarRelatorio() {
      try {
        setCarregando(true);
        setErro(null);

        // Buscar o usuário autenticado
        const usuario =
          await usuarioService.buscarUsuarioLogado();

        // Recuperar o ID real do paciente
        const idPaciente = usuario?.dados?.id_paciente;

        if (idPaciente == null) {
          throw new Error("Paciente não identificado.");
        }

        // Buscar os relatórios do paciente
        const dados =
          await relatorioService.buscarPorPaciente(
            idPaciente
          );

        if (ativo) {
          setRelatorio(dados);
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error.message === "Paciente não identificado."
              ? error.message
              : "Não foi possível carregar os relatórios."
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarRelatorio();

    return () => {
      ativo = false;
    };
  }, []);

  // ======================================
  // DADOS DOS GRÁFICOS
  // ======================================

  const tendencia =
    relatorio?.tendencia_semanal ?? [];

  const horarios =
    relatorio?.horarios ?? [];

  const distribuicao =
    relatorio?.distribuicao ?? {};

  const totalRegistros =
    relatorio?.resumo?.total_registros ?? 0;

  const mediaSemanal =
    relatorio?.resumo?.media_semanal ?? 0;

  const maiorTendencia = Math.max(
    1,
    ...tendencia.map((item) => item.quantidade)
  );

  const maiorHorario = Math.max(
    1,
    ...horarios.map((item) => item.quantidade)
  );

  const tipos = [
    {
      nome: "Alerta",
      percentual: distribuicao.alerta ?? 0,
      cor: colors.warning,
    },
    {
      nome: "Emergência",
      percentual: distribuicao.emergencia ?? 0,
      cor: colors.danger,
    },
    {
      nome: "Outros",
      percentual: distribuicao.outros ?? 0,
      cor: colors.primary,
    },
  ];

  const tipoPredominante = tipos.reduce(
    (maior, atual) =>
      atual.percentual > maior.percentual
        ? atual
        : maior,
    tipos[0]
  );

  // ======================================
  // CARREGAMENTO
  // ======================================

  if (carregando) {
    return (
      <AppShell
        tela={tela}
        setTela={setTela}
        eyebrow="Acompanhamento"
        title="Relatórios e análises"
        subtitle="Carregando informações..."
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </AppShell>
    );
  }

  // ======================================
  // ERRO
  // ======================================

  if (erro) {
    return (
      <AppShell
        tela={tela}
        setTela={setTela}
        eyebrow="Acompanhamento"
        title="Relatórios e análises"
        subtitle="Não foi possível carregar os dados."
      >
        <Card>
          <Text style={styles.cardTitle}>
            {erro}
          </Text>
        </Card>
      </AppShell>
    );
  }

  // ======================================
  // TELA PRINCIPAL
  // ======================================

  return (
    <AppShell
      tela={tela}
      setTela={setTela}
      eyebrow="Acompanhamento"
      title="Relatórios e análises"
      subtitle="Visualize padrões e tendências dos registros do paciente."
    >
      <SectionHeader
        icon={BarChart3}
        title="Visão geral"
        subtitle="Indicadores das últimas semanas"
      />

      {/* ==================================
          TENDÊNCIA SEMANAL
      ================================== */}

      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <TrendingUp
              size={20}
              color={colors.primary}
            />
          </View>

          <View>
            <Text style={styles.cardTitle}>
              Tendência semanal
            </Text>

            <Text style={styles.cardSubtitle}>
              Últimas semanas
            </Text>
          </View>
        </View>

        <View style={styles.chart}>
          {tendencia.map((item, index) => {
            const altura =
              (item.quantidade / maiorTendencia) * 120;

            return (
              <View
                key={index}
                style={styles.barContainer}
              >
                <Text style={styles.barValue}>
                  {item.quantidade}
                </Text>

                <View
                  style={[
                    styles.bar,
                    { height: altura },
                  ]}
                />

                <Text style={styles.barLabel}>
                  {item.semana}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.chartLegend}>
          <View style={styles.legendDot} />

          <Text style={styles.legendText}>
            Número de registros de risco
          </Text>
        </View>
      </Card>

      {/* ==================================
          DISTRIBUIÇÃO POR TIPO
      ================================== */}

      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <PieChart
              size={20}
              color={colors.primary}
            />
          </View>

          <View>
            <Text style={styles.cardTitle}>
              Distribuição por tipo
            </Text>

            <Text style={styles.cardSubtitle}>
              Registros monitorados
            </Text>
          </View>
        </View>

        <View style={styles.distributionContainer}>
          <View
            style={[
              styles.fakePie,
              {
                backgroundColor:
                  totalRegistros > 0
                    ? tipoPredominante.cor
                    : colors.primaryLight,
              },
            ]}
          >
            <View style={styles.fakePieInner}>
              <Text style={styles.pieValue}>
                {totalRegistros > 0
                  ? `${tipoPredominante.percentual}%`
                  : "0%"}
              </Text>

              <Text style={styles.pieLabel}>
                {totalRegistros > 0
                  ? tipoPredominante.nome
                  : "Sem dados"}
              </Text>
            </View>
          </View>

          <View style={styles.legendContainer}>
            {tipos.map((tipo, index) => (
              <View
                key={index}
                style={styles.legendRow}
              >
                <View
                  style={[
                    styles.legendIndicator,
                    {
                      backgroundColor: tipo.cor,
                    },
                  ]}
                />

                <View>
                  <Text style={styles.legendTitle}>
                    {tipo.nome}
                  </Text>

                  <Text style={styles.legendValue}>
                    {tipo.percentual}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Card>

      {/* ==================================
          HORÁRIO DOS EVENTOS
      ================================== */}

      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Clock3
              size={20}
              color={colors.primary}
            />
          </View>

          <View>
            <Text style={styles.cardTitle}>
              Horário dos eventos
            </Text>

            <Text style={styles.cardSubtitle}>
              Distribuição ao longo do dia
            </Text>
          </View>
        </View>

        <View style={styles.chart}>
          {horarios.map((item, index) => {
            const altura =
              (item.quantidade / maiorHorario) * 120;

            return (
              <View
                key={index}
                style={styles.barContainer}
              >
                <Text style={styles.barValue}>
                  {item.quantidade}
                </Text>

                <View
                  style={[
                    styles.timeBar,
                    { height: altura },
                  ]}
                />

                <Text style={styles.barLabel}>
                  {item.hora}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* ==================================
          RESUMO
      ================================== */}

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            Registros de risco
          </Text>

          <Text style={styles.summaryValue}>
            {totalRegistros}
          </Text>

          <Text style={styles.summaryDescription}>
            últimos 30 dias
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            Média
          </Text>

          <Text style={styles.summaryValue}>
            {Number(mediaSemanal)
              .toFixed(1)
              .replace(".", ",")}
          </Text>

          <Text style={styles.summaryDescription}>
            registros por semana
          </Text>
        </View>
      </View>
    </AppShell>
  );
}

// ======================================
// ESTILOS
// ======================================

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.soft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  cardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },

  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },

  chart: {
    minHeight: 145,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  barContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  bar: {
    width: 20,
    maxHeight: 120,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: colors.primary,
    opacity: 0.85,
  },

  timeBar: {
    width: 20,
    maxHeight: 120,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: colors.lilac,
  },

  barLabel: {
    color: colors.textMuted,
    fontSize: 8,
    marginTop: 6,
    marginBottom: 5,
  },

  barValue: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
    marginBottom: 4,
  },

  chartLegend: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },

  legendText: {
    color: colors.textSecondary,
    fontSize: 10,
  },

  distributionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },

  fakePie: {
    width: 145,
    height: 145,
    borderRadius: 73,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xl,
    borderWidth: 18,
    borderColor: colors.primaryLight,
  },

  fakePieInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  pieValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "900",
  },

  pieLabel: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 2,
  },

  legendContainer: {
    flex: 1,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  legendIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },

  legendTitle: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: "700",
  },

  legendValue: {
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 1,
  },

  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 10,
  },

  summaryValue: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: "900",
    marginTop: 5,
  },

  summaryDescription: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 3,
  },
});
