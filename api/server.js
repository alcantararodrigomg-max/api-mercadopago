import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/gerar-pix", async (req, res) => {
  const { valor, descricao, email } = req.body;

  const body = {
    transaction_amount: valor,
    description: descricao,
    payment_method_id: "pix",
    payer: { email }
  };

  const resposta = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      "Authorization": "Bearer APP_USR-3655461486087243-110502-f3699b09140e5585040057f9a16f0529-1148552403",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await resposta.json();
  if (data.error) {
    return res.status(400).json(data);
  }

  res.json({
    qr: data.point_of_interaction.transaction_data.qr_code_base64,
    copiaecola: data.point_of_interaction.transaction_data.qr_code
  });
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
