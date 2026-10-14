
import api from "./api";

const relatorioService = {
  async buscarPorPaciente(idPaciente) {
    if (!idPaciente) {
      throw new Error("ID do paciente não informado.");
    }

    const resposta = await api.get(
      `/relatorios/paciente/${idPaciente}`
    );

    return resposta.data;
  },
};

export default relatorioService;
