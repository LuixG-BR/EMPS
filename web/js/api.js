const API = "https://emps-backend-17ip.onrender.com";

async function requisicao(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const resposta = await fetch(`${API}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? {
                "Authorization": `Bearer ${token}`
            } : {}),
            ...options.headers
        }
    });

    if (resposta.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "login.html";

        throw new Error("Sessão expirada.");
    }

    if (!resposta.ok) {
        throw new Error(`Erro na API: ${resposta.status}`);
    }

    return await resposta.json();
}

async function listarPacientes() {
    return await requisicao("/medicos/me/pacientes");
}
