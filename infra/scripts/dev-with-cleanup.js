const { spawn, exec } = require("node:child_process");

console.log("🚀 Iniciando ambiente de desenvolvimento...\n");

// Inicia o processo do Next.js
const nextProcess = spawn("next", ["dev"], {
  stdio: "inherit",
  shell: true,
});

// Função para derrubar os serviços
function cleanup() {
  console.log("\n\n🔴 Encerrando serviços...");

  exec("docker compose -f infra/compose.yaml stop", (error) => {
    if (error) {
      console.error("❌ Erro ao parar os serviços:", error.message);
    } else {
      console.log("✅ Serviços encerrados com sucesso");
    }
    process.exit(0);
  });
}

// Captura SIGINT (Ctrl+C)
process.on("SIGINT", () => {
  console.log("\n\n🛑 Recebido sinal de interrupção (Ctrl+C)");
  nextProcess.kill("SIGINT");
  cleanup();
});

// Captura SIGTERM
process.on("SIGTERM", () => {
  console.log("\n\n🛑 Recebido sinal de término");
  nextProcess.kill("SIGTERM");
  cleanup();
});

// Captura quando o processo Next.js encerra
nextProcess.on("close", (code) => {
  if (code !== null && code !== 0) {
    console.log(`\n⚠️  Next.js encerrou com código: ${code}`);
  }
  cleanup();
});
