const SYSTEM_PROMPT = `You are an Egston Power Electronics quote assistant. Collect information to create a quotation.

CONFIGURATIONS:
- CONFIG-A: Single-Channel R&D Test System (2 kW), EU freight, base cost ~31,800 EUR
- CONFIG-B: Multi-Channel Production Test System (2x5 kW), international shipping, base cost ~85k EUR
- CONFIG-CUSTOM: AI-configured based on customer requirements

OPTIONAL ADD-ONS:
- CTR-004: Advanced Data Logging Software - 2,800 EUR
- INS-005: On-site Installation & Startup (16h) - 130 EUR/h
- INS-006: Customer Training on-site (8h) - 140 EUR/h
- TRP-004: Air Freight international express - 3,200 EUR

Margin: 35% | Commission: 5% | Lead time: 9-12 months

Collect step by step: customer name, address, country, configuration, options, delivery terms, quote number, then confirm.
Ask max 2 things at a time. Respond in user language (German/English).
After confirmation output EXACTLY:
TRIGGER_WEBHOOK:{"customer_name":"...","customer_address":"...","customer_country":"...","delivery_terms":"FCA St. Poelten, Austria (Incoterms 2020)","quote_number":"...","quote_date":"DD.MM.YYYY","configuration":"CONFIG-X","selected_options":[],"custom_prompt":"","notes":""}`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const { messages, today } = JSON.parse(event.body);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 1000, system: SYSTEM_PROMPT + `\n\nToday: ${today}`, messages })
    });
    const data = await response.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: data.content[0].text }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
