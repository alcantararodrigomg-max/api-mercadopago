import fetch from "node-fetch";

export default async function handler(req, res) {
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
    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json(data);
    }

    return res.status(200).json({
      qr: data.point_of_interaction.transaction_data.qr_code_base64,
      copiaecola: data.point_of_interaction.transaction_data.qr_code
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao gerar Pix", details: err.message });
  }
}
