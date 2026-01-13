import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DataBaseInfo />
    </>
  );
}

function DataBaseInfo() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  let databaseVersion = data.dependencies.database.version;
  let databaseMaxConnections = data.dependencies.database.max_connections;
  let databaseOpenedConnections = data.dependencies.database.opened_connections;

  return (
    <div>
      <h3>Database</h3>
      <div>
        <div>Versão: {databaseVersion}</div>
        <div>Max Connections: {databaseMaxConnections}</div>
        <div>Opened Connections: {databaseOpenedConnections}</div>
      </div>
    </div>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <div>Última atualização: {updatedAtText}</div>;
}
