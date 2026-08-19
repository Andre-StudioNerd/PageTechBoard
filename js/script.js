// Função auxiliar para atualizar o texto no HTML de forma segura
function atualizarElemento(id, texto) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.innerText = texto;
  }
}

// 1. Obtém o Endereço IP e Geolocalização
async function carregarDadosIP() {
  try {
    const resposta = await fetch("https://ipapi.co/json/");
    const dados = await resposta.json();

    atualizarElemento("info-ip", dados.ip || "Não disponível");
    atualizarElemento(
      "info-local",
      `${dados.city || ""}, ${dados.region || ""} - ${dados.country_name || ""}`,
    );
    atualizarElemento("info-provedor", dados.org || "Não disponível");
  } catch (erro) {
    atualizarElemento("info-ip", "Erro ao carregar");
    atualizarElemento("info-local", "Erro ao carregar");
    atualizarElemento("info-provedor", "Erro ao carregar");
    console.error("Erro ao buscar IP:", erro);
  }
}

// 2. Obtém Informações de Conexão e Rede
function carregarDadosRede() {
  atualizarElemento(
    "info-status",
    navigator.onLine ? "Online 🟢" : "Offline 🔴",
  );

  const conexao =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  if (conexao) {
    atualizarElemento(
      "info-tipo-rede",
      conexao.effectiveType ? conexao.effectiveType.toUpperCase() : "N/A",
    );
    atualizarElemento(
      "info-velocidade",
      conexao.downlink ? `${conexao.downlink} Mbps` : "N/A",
    );
  } else {
    atualizarElemento("info-tipo-rede", "Não suportado");
    atualizarElemento("info-velocidade", "Não suportado");
  }
}

// 3. Obtém Informações de Hardware (CPU, RAM, GPU)
function carregarDadosHardware() {
  // Núcleos do Processador
  const nucleos = navigator.hardwareConcurrency;
  atualizarElemento(
    "info-cpu",
    nucleos ? `${nucleos} núcleos` : "Não disponível",
  );

  // Memória RAM Estimada
  const ram = navigator.deviceMemory;
  atualizarElemento("info-ram", ram ? `~${ram} GB` : "Não disponível");

  // Placa de Vídeo (GPU)
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      const gpu = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : "Genérica / Não identificada";
      atualizarElemento("info-gpu", gpu);
    } else {
      atualizarElemento("info-gpu", "WebGL não suportado");
    }
  } catch (e) {
    atualizarElemento("info-gpu", "Erro ao identificar");
  }
}

// 4. Obtém Informações de Bateria
async function carregarDadosBateria() {
  if ("getBattery" in navigator) {
    try {
      const bateria = await navigator.getBattery();

      const atualizarStatusBateria = () => {
        const nivel = Math.round(bateria.level * 100);
        const statusCarregando = bateria.charging ? " (Carregando ⚡)" : "";
        atualizarElemento("info-bateria", `${nivel}%${statusCarregando}`);
      };

      atualizarStatusBateria();

      // Atualiza automaticamente caso o status mude
      bateria.addEventListener("levelchange", atualizarStatusBateria);
      bateria.addEventListener("chargingchange", atualizarStatusBateria);
    } catch (e) {
      atualizarElemento("info-bateria", "Erro ao acessar");
    }
  } else {
    atualizarElemento("info-bateria", "API não suportada neste navegador");
  }
}

// 5. Obtém Informações do Sistema e Tela
function carregarDadosSistema() {
  // Tela
  const largura = window.screen.width;
  const altura = window.screen.height;
  atualizarElemento("info-tela", `${largura}x${altura} px`);

  // Idioma
  atualizarElemento("info-idioma", navigator.language || "N/A");

  // Sistema Operacional
  const plataforma = navigator.userAgentData
    ? navigator.userAgentData.platform
    : navigator.platform;
  atualizarElemento("info-so", plataforma || "N/A");
}

// Inicializa a coleta de dados quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  carregarDadosIP();
  carregarDadosRede();
  carregarDadosHardware();
  carregarDadosBateria();
  carregarDadosSistema();

  // Ouvintes de evento para alteração do status de conexão
  window.addEventListener("online", () =>
    atualizarElemento("info-status", "Online 🟢"),
  );
  window.addEventListener("offline", () =>
    atualizarElemento("info-status", "Offline 🔴"),
  );
});
