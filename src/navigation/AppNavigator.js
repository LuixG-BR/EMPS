import React, { useEffect, useState } from "react";
import { View } from "react-native";

import authStorage from "../storage/authStorage";

import TelaLogin from "../telas/TelaLogin";
import TelaInicio from "../telas/TelaInicio";
import TelaPerfil from "../telas/TelaPerfil";
import TelaMedicacoes from "../telas/TelaMedicacoes";
import TelaAnalises from "../telas/TelaAnalises";
import TelaCintaCardiaca from "../telas/TelaCintaCardiaca";
import TelaRegistrarCrise from "../telas/TelaRegistrarCrise";
import TelaMonitoramento from "../telas/TelaMonitoramento";

export default function AppNavigator() {
  const [tela, setTela] = useState(null);
  const [telasVisitadas, setTelasVisitadas] = useState([]);

  useEffect(() => {
    async function verificarLogin() {
      const token = await authStorage.buscarToken();

      setTela(token ? "inicio" : "login");
    }

    verificarLogin();
  }, []);

  // Mantém as telas visitadas montadas.
  useEffect(() => {
    if (!tela) return;

    if (tela === "login") {
      setTelasVisitadas(["login"]);
      return;
    }

    setTelasVisitadas((anteriores) => {
      if (anteriores.includes(tela)) {
        return anteriores;
      }

      return [...anteriores, tela];
    });
  }, [tela]);

  function renderizarTela(nome) {
    const props = {
      tela: nome,
      setTela,
    };

    switch (nome) {
      case "login":
        return <TelaLogin setTela={setTela} />;

      case "inicio":
        return <TelaInicio {...props} />;

      case "perfil":
        return <TelaPerfil {...props} />;

      case "medicacoes":
        return <TelaMedicacoes {...props} />;

      case "analises":
        return <TelaAnalises {...props} />;

      case "cinta":
        return <TelaCintaCardiaca {...props} />;

      case "registrarCrise":
        return <TelaRegistrarCrise {...props} />;

      case "monitoramento":
        return <TelaMonitoramento {...props} />;

      default:
        return null;
    }
  }

  if (!tela) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      {telasVisitadas.map((nome) => (
        <View
          key={nome}
          style={{
            flex: 1,
            display: tela === nome ? "flex" : "none",
          }}
        >
          {renderizarTela(nome)}
        </View>
      ))}
    </View>
  );
}
