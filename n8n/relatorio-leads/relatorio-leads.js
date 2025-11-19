/**
 * Relatório NeoSale — v8.1 (fix clienteNome + sem redeclarar grupos)
 * Agrupa SOMENTE por qualificação e inclui Guia de Qualificações do nó `qualificacoes`
 */

const d = $('get-relatorio/diario').first().json.data || {};

// --- Cliente (com fallbacks) ---
const clienteNome = $('cliente').first().json.nome;

// --- Data ---
const dataRef = d.periodo?.data_inicio || '';

// --- Totais ---
const tot = d.totais || {};
const criados     = Number(tot.criados ?? 0);
const atualizados = Number(tot.atualizados ?? 0);

// --- Distribuição (resumo) ---
const rawQual = d.distribuicao?.por_qualificacao ?? [];
const porQual = Array.isArray(rawQual)
  ? rawQual.map(q => ({
      nome: q.nome ?? q.status ?? q.key ?? '—',
      qtd: Number(q.qtd ?? q.count ?? q.value ?? 0),
      conversao: q.conversao ?? null,
    }))
  : Object.entries(rawQual).map(([nome, qtd]) => ({ nome, qtd: Number(qtd) }));

// --- Leads ---
const leadsCriados     = Array.isArray(d.detalhes?.leads_criados) ? d.detalhes.leads_criados : [];
const leadsAtualizados = Array.isArray(d.detalhes?.leads_atualizados) ? d.detalhes.leads_atualizados : [];
const allLeads = [...leadsCriados, ...leadsAtualizados];

// --- Qualificações (nó `qualificacoes`) ---
const qualRawList = $input.first().json.data ?? [];
const qualDefs = qualRawList.map(q => {
  let tipos = [];
  if (Array.isArray(q?.tipo_agente)) tipos = q.tipo_agente;
  else if (Array.isArray(q?.tipo_agente?.tipo_agente)) tipos = q.tipo_agente.tipo_agente;
  else if (typeof q?.tipo_agente === 'string') tipos = [q.tipo_agente];
  return {
    nome: q?.nome ?? '—',
    tipo_agente: tipos.filter(Boolean),
    descricao: q?.descricao ?? '—',
  };
});

// --- Helpers ---
const toNum  = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const brDate = (x) => new Date(x).toLocaleDateString('pt-BR');
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

const leadLine = (l) => {
  const nome = safe(l.nome);
  const tel  = l.telefone ? ` ${fmtTel(l.telefone)}` : ' —';
  return `${nome}:${tel}`;
};
const take = (arr, n = 10) => arr.slice(0, n);

// --- Agrupar por qualificação ---
const groupByQual = (arr) => {
  const map = new Map();
  arr.forEach(l => {
    const key = safe(l?.qualificacao?.nome ?? l?.qualificacao);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(l);
  });
  return [...map.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .map(([qual, items]) => ({ qual, items }));
};

// --- SUBJECT ---
const subject = `Relatório diário de Leads - ${clienteNome} - ${brDate(dataRef)}`;

// --- TEXT ---
const grupos = groupByQual(allLeads);

const text = [
  `Relatório NeoSale — ${clienteNome}`,
  `Data: ${brDate(dataRef)}`,
  ``,
  `Totais:`,
  `- Criados: ${fmtNum(criados)}`,
  `- Atualizados: ${fmtNum(atualizados)}`,
  ``,
  `Por qualificação:`,
  ...(porQual.length
    ? porQual.map(q => `- ${safe(q.nome)}: ${fmtNum(q.qtd)}${q.conversao ? ` (${q.conversao})` : ''}`)
    : ['- Sem registros']),
  ``,
  `Detalhes (agrupado somente por qualificação):`,
  ...(grupos.length
    ? grupos.flatMap(g => [
        `- ${g.qual}: ${g.items.length}`,
        ...take(g.items, 10).map(l => `     • ${leadLine(l)}`),
        ...(g.items.length > 10 ? [`     • ... +${g.items.length - 10} mais`] : []),
      ])
    : ['- —']),
].join('\n');

// --- HTML ---
const table = (title, headers, rows, transparentHeader = false) => `
  ${title ? `<h3 style="margin:24px 0 12px;font:600 16px/1.4 Arial,sans-serif;color:#1a1a1a">${title}</h3>` : ''}
  <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font:14px/1.5 Arial,sans-serif;border:1px solid #e0e0e0;${title ? 'border-radius:8px;' : ''}overflow:hidden;table-layout:fixed">
    <thead><tr style="background:${transparentHeader ? 'transparent' : 'linear-gradient(180deg,#f8f9fa 0%,#f1f3f5 100%)'}">${
      headers.map((h, idx) => `<th align="left" style="padding:12px 16px;font-weight:600;color:#495057;border-bottom:${transparentHeader ? '1px' : '2px'} solid #dee2e6;text-transform:uppercase;font-size:12px;letter-spacing:0.5px;${idx === 0 ? 'width:60%;' : 'width:40%;'}">${h}</th>`).join('')
    }</tr></thead>
    <tbody>${
      rows.length
        ? rows.map((r, i) => `<tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8f9fa'};transition:background 0.2s">${r.map((c, idx) => `<td style="padding:12px 16px;border-bottom:1px solid #e9ecef;color:#212529;${idx === 1 ? 'white-space:nowrap;' : ''}">${c}</td>`).join('')}</tr>`).join('')
        : `<tr><td colspan="${headers.length}" style="padding:16px;text-align:center;color:#868e96;font-style:italic">Sem registros</td></tr>`
    }</tbody>
  </table>
`;

const htmlGrupos = grupos.length
  ? grupos.map(g => table(
      `${g.qual}: ${g.items.length}`,
      ['Nome', 'Telefone'],
      g.items.slice(0, 10).map(l => [safe(l.nome), fmtTel(l.telefone)])
    ) + (g.items.length > 10
      ? `<p style="margin:8px 0 0;padding:12px;background:#f8f9fa;border-radius:6px;color:#495057;font-size:13px;text-align:center">... +${g.items.length - 10} leads adicionais</p>`
      : '')
    ).join('')
  : `<p style="margin:12px 0;padding:20px;background:#f8f9fa;border-radius:8px;color:#868e96;text-align:center;font-style:italic">Sem registros</p>`;

// Guia de qualificações (dinâmico)
const htmlQualGuide = table(
  'Guia de qualificações',
  ['Nome', 'Descrição'],
  (qualDefs.length ? qualDefs : []).map(q => [
    q.nome,
    q.descricao
  ]),
  true
);

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

const total = criados + atualizados;

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Desktop */
    .col-cell {
      width: 33%;
      vertical-align: top;
    }
    .col-cell:nth-child(1) {
      padding-right: 10px;
    }
    .col-cell:nth-child(2) {
      padding: 0 5px;
    }
    .col-cell:nth-child(3) {
      padding-left: 10px;
    }
    
    /* Mobile */
    @media only screen and (max-width: 600px) {
      .container { padding: 12px !important; max-width: 100% !important; }
      .metric-card { display: block !important; width: 100% !important; padding: 0 0 8px 0 !important; }
      .three-col-table { display: block !important; width: 100% !important; }
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
      ${metricCard('Criados', fmtNum(criados), '#0d6efd', '➕', 'rgba(13,110,253,0.1)')}
      ${metricCard('Atualizados', fmtNum(atualizados), '#ffc107', '🔄', 'rgba(255,193,7,0.1)')}
      ${metricCard('Deletados', '0', '#dc3545', '❌', 'rgba(220,53,69,0.1)')}
      ${metricCard('Total', fmtNum(total), '#198754', '👥', 'rgba(25,135,84,0.1)')}
    </tr>
  </table>

  <!-- Layout em 3 colunas -->
  <table width="100%" cellspacing="0" cellpadding="0" class="three-col-table">
    <tr style="vertical-align:top">
    
    <!-- Coluna 1: Por Qualificação -->
    <td class="col-cell">
      <table width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.08)">
        <tr>
          <td style="padding:20px">
            <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px">
              <tr>
                <td><h3 style="margin:0;font:600 16px/1.4 Arial,sans-serif;color:#212529">Por Qualificação</h3></td>
                <td style="width:30px;text-align:right"><span style="font-size:20px">👥</span></td>
              </tr>
            </table>
            ${porQual.map(q => {
              const percent = total > 0 ? ((q.qtd / total) * 100).toFixed(1) : '0.0';
              const colors = {
                'Novo': '#0d6efd',
                'Curioso': '#198754',
                'Decidido': '#ffc107',
                'Engajado': '#6f42c1',
                'Desinteressado': '#e91e63',
                'Indeciso': '#03a9f4',
                'Atendimento': '#4caf50',
                'Frustrado': '#ff9800'
              };
              const color = colors[q.nome] || '#6c757d';
              return `
                <table width="100%" cellspacing="0" cellpadding="0" style="border-bottom:1px solid #f0f0f0">
                  <tr>
                    <td style="padding:12px 0">
                      <span style="display:inline-block;width:8px;height:8px;background:${color};border-radius:50%;margin-right:8px;vertical-align:middle"></span>
                      <span style="font:400 14px/1.4 Arial,sans-serif;color:#212529;vertical-align:middle">${safe(q.nome)}</span>
                    </td>
                    <td style="text-align:right;padding:12px 0;white-space:nowrap">
                      <span style="font:600 14px/1.4 Arial,sans-serif;color:#212529">${fmtNum(q.qtd)}</span>
                      <span style="font:400 12px/1.4 Arial,sans-serif;color:#6c757d;margin-left:4px">(${percent}%)</span>
                    </td>
                  </tr>
                </table>
              `;
            }).join('')}
          </td>
        </tr>
      </table>
    </td>

    <!-- Coluna 2: Leads Criados -->
    <td class="col-cell">
      <table width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.08)">
        <tr>
          <td style="padding:20px">
            <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px">
              <tr>
                <td><h3 style="margin:0;font:600 16px/1.4 Arial,sans-serif;color:#212529">Leads Criados</h3></td>
                <td style="width:30px;text-align:right"><span style="font-size:20px">➕</span></td>
              </tr>
            </table>
            ${leadsCriados.slice(0, 10).map(l => {
              const qualNome = safe(l?.qualificacao?.nome ?? l?.qualificacao);
              const qualColors = {
                'Novo': { bg: '#e7f1ff', text: '#0d6efd' },
                'Curioso': { bg: '#d1f4e0', text: '#198754' },
                'Decidido': { bg: '#fff3cd', text: '#ffc107' },
                'Engajado': { bg: '#f3e5f5', text: '#6f42c1' },
                'Desinteressado': { bg: '#fce4ec', text: '#e91e63' },
                'Indeciso': { bg: '#e1f5fe', text: '#03a9f4' },
                'Atendimento': { bg: '#e8f5e9', text: '#4caf50' },
                'Frustrado': { bg: '#fff3e0', text: '#ff9800' }
              };
              const qualColor = qualColors[qualNome] || { bg: '#f8f9fa', text: '#6c757d' };
              return `
                <table width="100%" cellspacing="0" cellpadding="0" style="background:#fafbfc;border:1px solid #e9ecef;border-radius:6px;margin-bottom:8px">
                  <tr>
                    <td style="padding:12px">
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="width:100%;vertical-align:top">
                            <p style="margin:0 0 6px;font:600 14px/1.4 Arial,sans-serif;color:#212529">${safe(l.nome)}</p>
                            <p style="margin:0 0 6px;font:400 13px/1.4 Arial,sans-serif;color:#6c757d">${fmtTel(l.telefone)}</p>
                            <span style="display:inline-block;padding:4px 8px;background:${qualColor.bg};color:${qualColor.text};border-radius:4px;font:600 11px/1.4 Arial,sans-serif">${qualNome}</span>
                          </td>
                          <td style="width:32px;vertical-align:top;text-align:right">
                            <div style="width:32px;height:32px;background:#6366f1;border-radius:6px;text-align:center;line-height:32px;font-size:16px">💬</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              `;
            }).join('')}
            ${leadsCriados.length > 10 ? `<p style="margin:12px 0 0;text-align:center;font:400 13px/1.4 Arial,sans-serif;color:#6c757d">... +${leadsCriados.length - 10} leads</p>` : ''}
            ${leadsCriados.length === 0 ? `<p style="margin:0;padding:20px;text-align:center;font:400 13px/1.4 Arial,sans-serif;color:#6c757d;font-style:italic">Nenhum lead criado</p>` : ''}
          </td>
        </tr>
      </table>
    </td>

    <!-- Coluna 3: Leads Atualizados -->
    <td class="col-cell">
      <table width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.08)">
        <tr>
          <td style="padding:20px">
            <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px">
              <tr>
                <td><h3 style="margin:0;font:600 16px/1.4 Arial,sans-serif;color:#212529">Leads Atualizados</h3></td>
                <td style="width:30px;text-align:right"><span style="font-size:20px">🔄</span></td>
              </tr>
            </table>
            ${leadsAtualizados.slice(0, 10).map(l => {
              const qualNome = safe(l?.qualificacao?.nome ?? l?.qualificacao);
              const qualColors = {
                'Novo': { bg: '#e7f1ff', text: '#0d6efd' },
                'Curioso': { bg: '#d1f4e0', text: '#198754' },
                'Decidido': { bg: '#fff3cd', text: '#ffc107' },
                'Engajado': { bg: '#f3e5f5', text: '#6f42c1' },
                'Desinteressado': { bg: '#fce4ec', text: '#e91e63' },
                'Indeciso': { bg: '#e1f5fe', text: '#03a9f4' },
                'Atendimento': { bg: '#e8f5e9', text: '#4caf50' },
                'Frustrado': { bg: '#fff3e0', text: '#ff9800' }
              };
              const qualColor = qualColors[qualNome] || { bg: '#f8f9fa', text: '#6c757d' };
              return `
                <table width="100%" cellspacing="0" cellpadding="0" style="background:#fafbfc;border:1px solid #e9ecef;border-radius:6px;margin-bottom:8px">
                  <tr>
                    <td style="padding:12px">
                      <table width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="width:100%;vertical-align:top">
                            <p style="margin:0 0 6px;font:600 14px/1.4 Arial,sans-serif;color:#212529">${safe(l.nome)}</p>
                            <p style="margin:0 0 6px;font:400 13px/1.4 Arial,sans-serif;color:#6c757d">${fmtTel(l.telefone)}</p>
                            <span style="display:inline-block;padding:4px 8px;background:${qualColor.bg};color:${qualColor.text};border-radius:4px;font:600 11px/1.4 Arial,sans-serif">${qualNome}</span>
                          </td>
                          <td style="width:32px;vertical-align:top;text-align:right">
                            <div style="width:32px;height:32px;background:#6366f1;border-radius:6px;text-align:center;line-height:32px;font-size:16px">💬</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              `;
            }).join('')}
            ${leadsAtualizados.length > 10 ? `<p style="margin:12px 0 0;text-align:center;font:400 13px/1.4 Arial,sans-serif;color:#6c757d">... +${leadsAtualizados.length - 10} leads</p>` : ''}
            ${leadsAtualizados.length === 0 ? `<p style="margin:0;padding:20px;text-align:center;font:400 13px/1.4 Arial,sans-serif;color:#6c757d;font-style:italic">Nenhum lead atualizado</p>` : ''}
          </td>
        </tr>
      </table>
    </td>

    </tr>
  </table>

  <!-- Detalhes por Qualificação -->
  ${grupos.map(g => {
    const qualColors = {
      'Novo': { bg: '#e7f1ff', text: '#0d6efd', border: '#0d6efd' },
      'Curioso': { bg: '#d1f4e0', text: '#198754', border: '#198754' },
      'Decidido': { bg: '#fff3cd', text: '#ffc107', border: '#ffc107' },
      'Engajado': { bg: '#f3e5f5', text: '#6f42c1', border: '#6f42c1' },
      'Desinteressado': { bg: '#fce4ec', text: '#e91e63', border: '#e91e63' },
      'Indeciso': { bg: '#e1f5fe', text: '#03a9f4', border: '#03a9f4' },
      'Atendimento': { bg: '#e8f5e9', text: '#4caf50', border: '#4caf50' },
      'Frustrado': { bg: '#fff3e0', text: '#ff9800', border: '#ff9800' }
    };
    const qualStyle = qualColors[g.qual] || { bg: '#f8f9fa', text: '#6c757d', border: '#6c757d' };
    
    return `
  <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;background:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.08);overflow:hidden">
    <tr>
      <td style="padding:16px 20px;background:${qualStyle.bg};border-left:4px solid ${qualStyle.border}">
        <h3 style="margin:0;font:600 18px/1.4 Arial,sans-serif;color:${qualStyle.text}">${g.qual} (${g.items.length} leads)</h3>
      </td>
    </tr>
    <tr>
      <td style="padding:0">
        ${table('', ['Nome', 'Telefone'], g.items.map(l => [safe(l.nome), fmtTel(l.telefone)]), true)}
      </td>
    </tr>
  </table>
    `;
  }).join('')}

  ${qualDefs.length ? `
    <div style="margin-top:24px;background:#ffffff;border-radius:8px;padding:20px;box-shadow:0 2px 4px rgba(0,0,0,0.08)">
      ${htmlQualGuide}
    </div>
  ` : ''}

  <div style="margin-top:24px;padding:16px;text-align:center">
    <p style="margin:0;font:400 12px/1.5 Arial,sans-serif;color:#adb5bd">Relatório diário — ${clienteNome} — ${brDate(dataRef)}</p>
    <p style="margin:4px 0 0;font:400 12px/1.5 Arial,sans-serif;color:#adb5bd">Envio automático — NeoSale</p>
  </div>
</div>
</body>
</html>
`;

// --- WhatsApp (sem redeclarar `grupos`) ---
const wLines = [];
wLines.push(`*📊 Relatório Diário de Leads*`);
wLines.push(`${clienteNome} - ${brDate(dataRef)}\n`);

// Métricas
wLines.push(`*Resumo:*`);
wLines.push(`➕ Criados: ${fmtNum(criados)}`);
wLines.push(`🔄 Atualizados: ${fmtNum(atualizados)}`);
wLines.push(`❌ Deletados: 0`);
wLines.push(`👥 Total: ${fmtNum(total)}\n`);

// Por Qualificação
wLines.push('*Por Qualificação:*');
if (porQual.length) {
  porQual.forEach(q => {
    const percent = total > 0 ? ((q.qtd / total) * 100).toFixed(1) : '0.0';
    wLines.push(`• ${safe(q.nome)}: ${fmtNum(q.qtd)} (${percent}%)`);
  });
} else {
  wLines.push('• Sem registros');
}

// Leads Criados
wLines.push('\n*Leads Criados:*');
if (leadsCriados.length > 0) {
  leadsCriados.slice(0, 10).forEach(l => {
    const qualNome = safe(l?.qualificacao?.nome ?? l?.qualificacao);
    wLines.push(`• ${safe(l.nome)}`);
    wLines.push(`  ${fmtTel(l.telefone)} - ${qualNome}`);
  });
  if (leadsCriados.length > 10) {
    wLines.push(`... +${leadsCriados.length - 10} leads`);
  }
} else {
  wLines.push('• Nenhum lead criado');
}

// Leads Atualizados
wLines.push('\n*Leads Atualizados:*');
if (leadsAtualizados.length > 0) {
  leadsAtualizados.slice(0, 10).forEach(l => {
    const qualNome = safe(l?.qualificacao?.nome ?? l?.qualificacao);
    wLines.push(`• ${safe(l.nome)}`);
    wLines.push(`  ${fmtTel(l.telefone)} - ${qualNome}`);
  });
  if (leadsAtualizados.length > 10) {
    wLines.push(`... +${leadsAtualizados.length - 10} leads`);
  }
} else {
  wLines.push('• Nenhum lead atualizado');
}

// Detalhes por Qualificação
wLines.push('\n*Detalhes por Qualificação:*');
if (!grupos.length) {
  wLines.push('• Sem registros');
} else {
  grupos.forEach(g => {
    wLines.push(`\n*${g.qual} (${g.items.length} leads):*`);
    g.items.forEach(l => {
      wLines.push(`• ${safe(l.nome)} - ${fmtTel(l.telefone)}`);
    });
  });
}

const whatsapp = wLines.join('\n');

return [{ subject, text, html, whatsapp }];
