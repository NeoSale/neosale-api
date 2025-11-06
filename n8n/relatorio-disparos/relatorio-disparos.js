/**
 * Relatório NeoSale — Follow-up por Dia v1.0
 * Exibe detalhes das mensagens enviadas com status de sucesso/erro
 */

const d = $input.first().json.data;

// --- Cliente (com fallbacks) ---
const clienteNome = $('cliente').first().json.nome;

// --- Data ---
const dataRef = new Date(Date.now()).toISOString().split('T')[0];

// --- Disparos (mensagens) ---
// d já é o array de registros
const disparos = Array.isArray(d)
  ? d.map(msg => ({
      lead: msg.nome_lead || '—',
      telefone: msg.telefone_lead || '—',
      horario: msg.horario || new Date().toISOString(),
      status: msg.status || 'Desconhecido',
      mensagem: msg.mensagem_enviada || '—',
      erro: msg.mensagem_erro || null
    }))
  : [];

// --- Totais (calculados a partir dos disparos) ---
const totalMensagens = disparos.length;
const totalSucessos = disparos.filter(d => d.status.toLowerCase() === 'sucesso').length;
const totalErros = disparos.filter(d => d.status.toLowerCase() !== 'sucesso').length;
const taxaSucesso = totalMensagens > 0 ? ((totalSucessos / totalMensagens) * 100).toFixed(1) : '0.0';

// --- Helpers ---
const toNum  = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const brDate = (x) => new Date(x).toLocaleDateString('pt-BR');
const brDateTime = (x) => {
  const date = new Date(x);
  return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};
const brTime = (x) => {
  const date = new Date(x);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};
const fmtNum = (v) => toNum(v).toLocaleString('pt-BR');
const safe   = (s) => (s ?? '—');

const fmtTel = (t) => {
  if (!t) return '—';
  const digits = t.toString().replace(/\D/g, '').replace(/^55/, '');
  if (digits.length === 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  if (digits.length === 9)  return `${digits.slice(0,5)}-${digits.slice(5)}`;
  if (digits.length === 8)  return `${digits.slice(0,4)}-${digits.slice(4)}`;
  return digits || '—';
};

const truncate = (str, maxLen = 100) => {
  if (!str) return '—';
  return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
};

// --- Agrupar por status ---
const groupByStatus = (arr) => {
  const map = new Map();
  arr.forEach(d => {
    const key = safe(d?.status ?? 'pendente');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(d);
  });
  return [...map.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .map(([status, items]) => ({ status, items }));
};

const grupos = groupByStatus(disparos);

// --- SUBJECT ---
const subject = `Relatório de Disparos - ${clienteNome} - ${brDate(dataRef)}`;

// --- TEXT ---
const text = [
  `Relatório NeoSale — Follow-up por Dia`,
  `Cliente: ${clienteNome}`,
  `Data: ${brDate(dataRef)}`,
  ``,
  `Totais:`,
  `- Total de Mensagens: ${fmtNum(totalMensagens)}`,
  `- Sucessos: ${fmtNum(totalSucessos)} (${taxaSucesso}%)`,
  `- Erros: ${fmtNum(totalErros)}`,
  ``,
  `Detalhes por status:`,
  ...(grupos.length
    ? grupos.flatMap(g => [
        `- ${g.status}: ${g.items.length}`,
        ...g.items.slice(0, 5).map(d => `     • ${safe(d.lead)} - ${fmtTel(d.telefone)} - ${brDateTime(d.horario)}`),
        ...(g.items.length > 5 ? [`     • ... +${g.items.length - 5} mais`] : []),
      ])
    : ['- Sem registros']),
].join('\n');

// --- HTML ---
const table = (title, headers, rows, transparentHeader = false) => `
  ${title ? `<h3 style="margin:24px 0 12px;font:600 16px/1.4 Arial,sans-serif;color:#1a1a1a">${title}</h3>` : ''}
  <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font:14px/1.5 Arial,sans-serif;border:1px solid #e0e0e0;${title ? 'border-radius:8px;' : ''}overflow:hidden;table-layout:fixed">
    <thead><tr style="background:${transparentHeader ? 'transparent' : 'linear-gradient(180deg,#f8f9fa 0%,#f1f3f5 100%)'}">${
      headers.map((h, idx) => `<th align="left" style="padding:12px 16px;font-weight:600;color:#495057;border-bottom:${transparentHeader ? '1px' : '2px'} solid #dee2e6;text-transform:uppercase;font-size:12px;letter-spacing:0.5px;${idx === 0 ? 'width:50%;' : idx === 1 ? 'width:15%;' : idx === 2 ? 'width:35%;' : 'width:auto;'}">${h}</th>`).join('')
    }</tr></thead>
    <tbody>${
      rows.length
        ? rows.map((r, i) => `<tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8f9fa'};transition:background 0.2s">${r.map((c, idx) => `<td style="padding:12px 16px;border-bottom:1px solid #e9ecef;color:#212529;${headers[idx]?.toLowerCase().includes('telefone') || headers[idx]?.toLowerCase().includes('horário') ? 'white-space:nowrap;' : ''}">${c}</td>`).join('')}</tr>`).join('')
        : `<tr><td colspan="${headers.length}" style="padding:16px;text-align:center;color:#868e96;font-style:italic">Sem registros</td></tr>`
    }</tbody>
  </table>
`;

// Tabela específica para Detalhes por Status (sem table-layout:fixed)
const tableDetalhes = (title, headers, rows, transparentHeader = false) => `
  ${title ? `<h3 style="margin:24px 0 12px;font:600 16px/1.4 Arial,sans-serif;color:#1a1a1a">${title}</h3>` : ''}
  <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font:14px/1.5 Arial,sans-serif;border:1px solid #e0e0e0;${title ? 'border-radius:8px;' : ''}overflow:hidden">
    <thead><tr style="background:${transparentHeader ? 'transparent' : 'linear-gradient(180deg,#f8f9fa 0%,#f1f3f5 100%)'}">${
      headers.map((h, idx) => `<th align="left" style="padding:12px 16px;font-weight:600;color:#495057;border-bottom:${transparentHeader ? '1px' : '2px'} solid #dee2e6;text-transform:uppercase;font-size:12px;letter-spacing:0.5px;${idx === 0 ? 'width:25%;' : idx === 1 ? 'width:18%;' : idx === 2 ? 'width:17%;' : 'width:40%;'}">${h}</th>`).join('')
    }</tr></thead>
    <tbody>${
      rows.length
        ? rows.map((r, i) => `<tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8f9fa'};transition:background 0.2s">${r.map((c, idx) => `<td style="padding:12px 16px;border-bottom:1px solid #e9ecef;color:#212529;vertical-align:top;${idx === 1 ? 'white-space:nowrap;' : idx === 2 ? 'white-space:nowrap;' : ''}">${c}</td>`).join('')}</tr>`).join('')
        : `<tr><td colspan="${headers.length}" style="padding:16px;text-align:center;color:#868e96;font-style:italic">Sem registros</td></tr>`
    }</tbody>
  </table>
`;

// Cards de métricas no estilo da imagem
const metricCard = (label, value, color, icon, bgColor) => `
  <td class="metric-card" style="width:25%;padding:0 8px">
    <table width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border-left:4px solid ${color};border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.08)">
      <tr>
        <td style="padding:20px">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="vertical-align:top">
                <p style="margin:0 0 10px;font:400 13px/1.4 Arial,sans-serif;color:#6c757d">${label}</p>
                <p style="margin:0;font:700 32px/1.2 Arial,sans-serif;color:#212529">${value}</p>
              </td>
              <td style="width:48px;vertical-align:top;text-align:right">
                <div style="width:48px;height:48px;background:${bgColor};border-radius:50%;text-align:center;line-height:48px;font-size:24px">
                  ${icon}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
`;

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Desktop */
    .col-cell {
      width: 50%;
      vertical-align: top;
    }
    .col-cell:nth-child(1) {
      padding-right: 10px;
    }
    .col-cell:nth-child(2) {
      padding-left: 10px;
    }
    
    /* Mobile */
    @media only screen and (max-width: 600px) {
      .container { padding: 12px !important; max-width: 100% !important; }
      .metric-card { display: block !important; width: 100% !important; padding: 0 0 8px 0 !important; }
      .two-col-table { display: block !important; width: 100% !important; }
      .col-cell { 
        display: block !important; 
        width: 100% !important; 
        padding: 0 0 16px 0 !important;
        box-sizing: border-box !important;
      }
      .col-cell table { 
        width: 100% !important; 
        max-width: 100% !important;
        overflow-x: auto !important;
        display: block !important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0">
<div class="container" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;max-width:1200px;margin:0 auto;padding:24px;background:#f8f9fa">
  
  <!-- Cards de métricas -->
  <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px">
    <tr>
      ${metricCard('Total de Mensagens', fmtNum(totalMensagens), '#6366f1', '📊', 'rgba(99,102,241,0.1)')}
      ${metricCard('Sucessos', fmtNum(totalSucessos), '#198754', '✅', 'rgba(25,135,84,0.1)')}
      ${metricCard('Erros', fmtNum(totalErros), '#dc3545', '❌', 'rgba(220,53,69,0.1)')}
      ${metricCard('Taxa de Sucesso', taxaSucesso + '%', '#0d6efd', '📈', 'rgba(13,110,253,0.1)')}
    </tr>
  </table>

  <!-- Layout em 2 colunas -->
  <table width="100%" cellspacing="0" cellpadding="0" class="two-col-table">
    <tr style="vertical-align:top">
    
    <!-- Coluna 1: Disparos com Sucesso -->
    <td class="col-cell">
      <table width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.08)">
        <tr>
          <td style="padding:20px">
            <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px">
              <tr>
                <td><h3 style="margin:0;font:600 16px/1.4 Arial,sans-serif;color:#212529">Disparos com Sucesso</h3></td>
                <td style="width:30px;text-align:right"><span style="font-size:20px">✅</span></td>
              </tr>
            </table>
            ${disparos.filter(d => d.status.toLowerCase() === 'sucesso').slice(0, 10).map(d => `
              <table width="100%" cellspacing="0" cellpadding="0" style="background:#fafbfc;border:1px solid #e9ecef;border-radius:6px;margin-bottom:8px">
                <tr>
                  <td style="padding:12px">
                    <table width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="vertical-align:top">
                          <p style="margin:0 0 6px;font:600 14px/1.4 Arial,sans-serif;color:#212529">${safe(d.lead)}</p>
                          <p style="margin:0 0 6px;font:400 13px/1.4 Arial,sans-serif;color:#6c757d">${fmtTel(d.telefone)}</p>
                          <p style="margin:0 0 6px;font:400 12px/1.4 Arial,sans-serif;color:#868e96">${brDateTime(d.horario)}</p>
                          <p style="margin:0;font:400 12px/1.4 Arial,sans-serif;color:#495057;font-style:italic">${truncate(d.mensagem, 80)}</p>
                        </td>
                        <td style="width:32px;vertical-align:top;text-align:right">
                          <div style="width:32px;height:32px;background:#198754;border-radius:6px;text-align:center;line-height:32px;font-size:16px">✅</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            `).join('')}
            ${disparos.filter(d => d.status.toLowerCase() === 'sucesso').length > 10 ? `<p style="margin:12px 0 0;text-align:center;font:400 13px/1.4 Arial,sans-serif;color:#6c757d">... +${disparos.filter(d => d.status.toLowerCase() === 'sucesso').length - 10} disparos</p>` : ''}
            ${disparos.filter(d => d.status.toLowerCase() === 'sucesso').length === 0 ? `<p style="margin:0;padding:20px;text-align:center;font:400 13px/1.4 Arial,sans-serif;color:#6c757d;font-style:italic">Nenhum disparo com sucesso</p>` : ''}
          </td>
        </tr>
      </table>
    </td>

    <!-- Coluna 2: Disparos com Erro -->
    <td class="col-cell">
      <table width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.08)">
        <tr>
          <td style="padding:20px">
            <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px">
              <tr>
                <td><h3 style="margin:0;font:600 16px/1.4 Arial,sans-serif;color:#212529">Disparos com Erro</h3></td>
                <td style="width:30px;text-align:right"><span style="font-size:20px">❌</span></td>
              </tr>
            </table>
            ${disparos.filter(d => d.status.toLowerCase() !== 'sucesso').slice(0, 10).map(d => `
              <table width="100%" cellspacing="0" cellpadding="0" style="background:#fafbfc;border:1px solid #e9ecef;border-radius:6px;margin-bottom:8px">
                <tr>
                  <td style="padding:12px">
                    <table width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="vertical-align:top">
                          <p style="margin:0 0 6px;font:600 14px/1.4 Arial,sans-serif;color:#212529">${safe(d.lead)}</p>
                          <p style="margin:0 0 6px;font:400 13px/1.4 Arial,sans-serif;color:#6c757d">${fmtTel(d.telefone)}</p>
                          <p style="margin:0 0 6px;font:400 12px/1.4 Arial,sans-serif;color:#868e96">${brDateTime(d.horario)}</p>
                          <p style="margin:0;font:400 12px/1.4 Arial,sans-serif;color:#dc3545;font-weight:600">${safe(d.erro) !== '—' ? 'Erro: ' + truncate(d.erro, 60) : 'Erro desconhecido'}</p>
                        </td>
                        <td style="width:32px;vertical-align:top;text-align:right">
                          <div style="width:32px;height:32px;background:#dc3545;border-radius:6px;text-align:center;line-height:32px;font-size:16px">❌</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            `).join('')}
            ${disparos.filter(d => d.status.toLowerCase() !== 'sucesso').length > 10 ? `<p style="margin:12px 0 0;text-align:center;font:400 13px/1.4 Arial,sans-serif;color:#6c757d">... +${disparos.filter(d => d.status.toLowerCase() !== 'sucesso').length - 10} disparos</p>` : ''}
            ${disparos.filter(d => d.status.toLowerCase() !== 'sucesso').length === 0 ? `<p style="margin:0;padding:20px;text-align:center;font:400 13px/1.4 Arial,sans-serif;color:#6c757d;font-style:italic">Nenhum disparo com erro</p>` : ''}
          </td>
        </tr>
      </table>
    </td>

    </tr>
  </table>

  <!-- Detalhes por Status -->
  ${grupos.map(g => {
    const statusColors = {
      'sucesso': { bg: '#d1f4e0', text: '#198754', border: '#198754' }
    };
    const statusStyle = statusColors[g.status.toLowerCase()] || { bg: '#fce4ec', text: '#dc3545', border: '#dc3545' };
    
    return `
  <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;background:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.08);overflow:hidden">
    <tr>
      <td style="padding:16px 20px;background:${statusStyle.bg};border-left:4px solid ${statusStyle.border}">
        <h3 style="margin:0;font:600 18px/1.4 Arial,sans-serif;color:${statusStyle.text}">${g.status.toUpperCase()} (${g.items.length} disparos)</h3>
      </td>
    </tr>
    <tr>
      <td style="padding:0">
        ${table('', ['Lead', 'Horário', 'Telefone'], g.items.map(d => [
          safe(d.lead), 
          brTime(d.horario),
          fmtTel(d.telefone),
        ]), true)}
      </td>
    </tr>
  </table>
    `;
  }).join('')}

  <div style="margin-top:24px;padding:16px;text-align:center">
    <p style="margin:0;font:400 12px/1.5 Arial,sans-serif;color:#adb5bd">Relatório de Disparos — ${clienteNome} — ${brDate(dataRef)}</p>
    <p style="margin:4px 0 0;font:400 12px/1.5 Arial,sans-serif;color:#adb5bd">Envio automático — NeoSale</p>
  </div>
</div>
</body>
</html>
`;

// --- WhatsApp ---
const wLines = [];
wLines.push(`*📤 Follow-up por Dia*`);
wLines.push(`${clienteNome} - ${brDate(dataRef)}\n`);

// Métricas
wLines.push(`*Resumo:*`);
wLines.push(`📊 Total de Mensagens: ${fmtNum(totalMensagens)}`);
wLines.push(`✅ Sucessos: ${fmtNum(totalSucessos)} (${taxaSucesso}%)`);
wLines.push(`❌ Erros: ${fmtNum(totalErros)}\n`);

// Disparos com Sucesso
wLines.push('*Disparos com Sucesso:*');
const sucessoDisparos = disparos.filter(d => d.status.toLowerCase() === 'sucesso');
if (sucessoDisparos.length > 0) {
  sucessoDisparos.slice(0, 5).forEach(d => {
    wLines.push(`• ${safe(d.lead)}`);
    wLines.push(`  ${fmtTel(d.telefone)} - ${brDateTime(d.horario)}`);
    wLines.push(`  _${truncate(d.mensagem, 60)}_`);
  });
  if (sucessoDisparos.length > 5) {
    wLines.push(`... +${sucessoDisparos.length - 5} disparos`);
  }
} else {
  wLines.push('• Nenhum disparo com sucesso');
}

// Disparos com Erro
wLines.push('\n*Disparos com Erro:*');
const erroDisparos = disparos.filter(d => d.status.toLowerCase() !== 'sucesso');
if (erroDisparos.length > 0) {
  erroDisparos.slice(0, 5).forEach(d => {
    wLines.push(`• ${safe(d.lead)}`);
    wLines.push(`  ${fmtTel(d.telefone)} - ${brDateTime(d.horario)}`);
    wLines.push(`  ⚠️ _${safe(d.erro) !== '—' ? truncate(d.erro, 60) : 'Erro desconhecido'}_`);
  });
  if (erroDisparos.length > 5) {
    wLines.push(`... +${erroDisparos.length - 5} disparos`);
  }
} else {
  wLines.push('• Nenhum disparo com erro');
}

// Detalhes por Status
wLines.push('\n*Detalhes por Status:*');
if (!grupos.length) {
  wLines.push('• Sem registros');
} else {
  grupos.forEach(g => {
    wLines.push(`\n*${g.status.toUpperCase()} (${g.items.length} disparos):*`);
    g.items.slice(0, 3).forEach(d => {
      wLines.push(`• ${safe(d.lead)} - ${fmtTel(d.telefone)}`);
      wLines.push(`  ${brDateTime(d.horario)}`);
    });
    if (g.items.length > 3) {
      wLines.push(`... +${g.items.length - 3} disparos`);
    }
  });
}

const whatsapp = wLines.join('\n');

return [{ subject, text, html, whatsapp }];
