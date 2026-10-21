
async function carregarPacientes() {
    const tabela = document.getElementById("patientTable");
    const contador = document.getElementById("contadorPacientes");

    if (!tabela) return;

    tabela.innerHTML = `
        <tr>
            <td colspan="6">Carregando pacientes...</td>
        </tr>
    `;

    try {
        const pacientes = await listarPacientes();

        if (contador) {
            contador.textContent = `${Array.isArray(pacientes) ? pacientes.length : 0} pacientes`;
        }

        if (!Array.isArray(pacientes) || pacientes.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="6">
                        Nenhum paciente encontrado.
                    </td>
                </tr>
            `;
            return;
        }

        tabela.innerHTML = "";

        pacientes.forEach(paciente => {
            const linha = document.createElement("tr");

            const nome = paciente.nome || "Não informado";
            const cpf = paciente.cpf || "Não informado";
            const telefone = paciente.telefone || "Não informado";

            let nascimento = "Não informado";

            if (paciente.data_nascimento) {
                const partes = paciente.data_nascimento.split("-");

                if (partes.length === 3) {
                    nascimento = `${partes[2]}/${partes[1]}/${partes[0]}`;
                } else {
                    nascimento = paciente.data_nascimento;
                }
            }

            const statusPaciente = paciente.status;
            let status = "Não informado";

            if (typeof statusPaciente === "boolean") {
                status = statusPaciente ? "Ativo" : "Inativo";
            } else if (
                statusPaciente !== null &&
                statusPaciente !== undefined
            ) {
                status = String(statusPaciente);
            }

            const colunaNome = document.createElement("td");
            colunaNome.textContent = nome;

            const colunaCpf = document.createElement("td");
            colunaCpf.textContent = cpf;

            const colunaTelefone = document.createElement("td");
            colunaTelefone.textContent = telefone;

            const colunaNascimento = document.createElement("td");
            colunaNascimento.textContent = nascimento;

            const colunaStatus = document.createElement("td");
            colunaStatus.textContent = status;

            const colunaAcao = document.createElement("td");
            const botao = document.createElement("button");

            botao.type = "button";
            botao.textContent = "Ver ficha";
            botao.classList.add("btn-visualizar");

            botao.addEventListener("click", function () {
                const idPaciente = paciente.id_paciente;

                if (!idPaciente) {
                    console.error("Paciente sem ID:", paciente);
                    alert("Não foi possível identificar este paciente.");
                    return;
                }

                window.location.href =
                    `paciente.html?id_paciente=${encodeURIComponent(idPaciente)}`;
            });

            colunaAcao.appendChild(botao);

            linha.append(
                colunaNome,
                colunaCpf,
                colunaTelefone,
                colunaNascimento,
                colunaStatus,
                colunaAcao
            );

            tabela.appendChild(linha);
        });

    } catch (error) {
        console.error("Erro ao carregar pacientes:", error);

        if (contador) {
            contador.textContent = "0 pacientes";
        }

        tabela.innerHTML = `
            <tr>
                <td colspan="6">
                    Não foi possível carregar os pacientes.
                    Verifique sua conexão e tente novamente.
                </td>
            </tr>
        `;
    }
}

document.addEventListener("DOMContentLoaded", carregarPacientes);
