import fetch from "node-fetch";

export default async function handler(req, res) {
  // 🔐 Permitir acesso de qualquer origem (CORS)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Responder requisições OPTIONS (pré-flight)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ❌ Bloqueia métodos diferentes de POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { valor, descricao, email } = req.body;

  const body = {
    transaction_amount: valor,
    description: descricao,
    payment_method_id: "pix",
    payer: { email }
  };

  try {
    // ⚙️ Chamada à API do Mercado Pago
    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`, // use sua variável no painel da Vercel
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    // 🧩 Verificação de erro
    if (data.error || !data.point_of_interaction) {
      console.error("Erro Mercado Pago:", data);
      return res.status(400).json({ error: "Erro ao gerar Pix", details: data });
    }

    // ✅ Retorna QR Code e código copia e cola
    return res.status(200).json({
      qr: data.point_of_interaction.transaction_data.qr_code_base64,
      copiaecola: data.point_of_interaction.transaction_data.qr_code
    });

  } catch (err) {
    console.error("Erro inesperado:", err);
    return res.status(500).json({ error: "Erro interno no servidor", details: err.message });
  }
}

