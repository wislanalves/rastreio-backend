
const express = require("express");
const cors = require("cors");
const app = express();
const clientes = require("./data/clientes.json");

app.use(cors());
app.use(express.json());

const eventos = [
  { dia: 0, evento: "Pedido recebido no Centro de Distribuição" },
  { dia: 2, evento: "Pedido em separação" },
  { dia: 5, evento: "Saiu para entrega" },
  { dia: 8, evento: "Em rota de entrega" },
  { dia: 12, evento: "Entregue" }
];

function calcularHistorico(dataPedido) {
  const hoje = new Date();
  const dataPedidoDate = new Date(dataPedido);
  const diasPassados = Math.floor((hoje - dataPedidoDate) / (1000 * 60 * 60 * 24));

  const historicoLiberado = eventos.filter(e => e.dia <= diasPassados);
  return {
    statusAtual: historicoLiberado.length > 0 ? historicoLiberado[historicoLiberado.length - 1].evento : "Aguardando processamento",
    historico: historicoLiberado
  };
}

app.get("/api/rastreio/:codigo", (req, res) => {
  const { codigo } = req.params;
  const cliente = clientes.find(c => c.codigo_rastreio === codigo);

  if (!cliente) {
    return res.status(404).json({ mensagem: "Código de rastreio não encontrado." });
  }

  const historicoInfo = calcularHistorico(cliente.data_pedido);

  res.json({
    nome: cliente.nome,
    produto: cliente.produto,
    endereco: cliente.endereco,
    statusAtual: historicoInfo.statusAtual,
    historico: historicoInfo.historico
  });
});

app.listen(process.env.PORT || 3001, () => console.log("Servidor de rastreio rodando..."));
