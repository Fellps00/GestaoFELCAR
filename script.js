let viagemSelecionada = null;
function logout() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
}

// Gerar código sequencial mensal
function gerarCodigo(data) {
    let mes = data.slice(0,7);
    let viagens = JSON.parse(localStorage.getItem("viagens")) || [];
    let seq = viagens.filter(v => v.mes === mes).length + 1;
    return `${mes}-${String(seq).padStart(3,'0')}`;
}

// Cadastro da viagem
document.getElementById("formViagem").addEventListener("submit", e => {
    e.preventDefault();

    let viagens = JSON.parse(localStorage.getItem("viagens")) || [];

    if (viagemEmEdicao) {
        // ATUALIZAR
        let index = viagens.findIndex(v => v.id === viagemEmEdicao.id);

        viagens[index] = {
            ...viagemEmEdicao,
            data: data.value,
            motorista: motorista.value,
            placa: placa.value,
            origem: origem.value,
            destino: destino.value,
            kmInicial: kmInicial.value,
            kmFinal: kmFinal.value,
            pesoCarregado: pesoCarregado.value,
            valorPorTonelada: valorPorTonelada.value,
            descontoFrete: descontoFrete.value,
            adiantamento: adiantamento.value,
            transportadora: transportadora.value,
            freteLiquido: freteLiquido.value,
            saldoFrete: saldoFrete.value,
            comissao: comissao.value,

            estadia: checkboxEstadia.checked,
            valorEstadia: valorEstadiaInput.value || 0,
            valorEstadia30: valor30Input.value || 0
        };

        viagemEmEdicao = null;
        alert("Viagem atualizada!");
    } else {
        // NOVA VIAGEM
        let mes = data.value.slice(0,7);

        viagens.push({
            id: Date.now(),
            codigo: gerarCodigo(data.value),
            mes,
            data: data.value,
            motorista: motorista.value,
            placa: placa.value,
            origem: origem.value,
            destino: destino.value,
            kmInicial: kmInicial.value,
            kmFinal: kmFinal.value,
            pesoCarregado: pesoCarregado.value,
            valorPorTonelada: valorPorTonelada.value,
            descontoFrete: descontoFrete.value,
            adiantamento: adiantamento.value,
            transportadora: transportadora.value,
            freteLiquido: freteLiquido.value,
            saldoFrete: saldoFrete.value,
            comissao: comissao.value,

            estadia: checkboxEstadia.checked,
            valorEstadia: valorEstadiaInput.value || 0,
            valorEstadia30: valor30Input.value || 0,

            acertada: false,

            despesas: [],
            abastecimentos: [],
            recebimentos: [],
            pedagios: [],
            vales: [],
        });
    }

    localStorage.setItem("viagens", JSON.stringify(viagens));
    formViagem.reset();
    listarViagens();
});
// ESTADIA
const checkboxEstadia = document.getElementById("houveEstadia");
const valorEstadiaInput = document.getElementById("valorEstadia");
const valor30Input = document.getElementById("valorEstadia30");

//calcular frete

function calcularFrete() {
    const peso = parseFloat(pesoCarregado.value) || 0;
    const valorTon = parseFloat(valorPorTonelada.value) || 0;
    const desconto = parseFloat(descontoFrete.value) || 0;
    const adiant = parseFloat(adiantamento.value) || 0;

    const freteLiquidoCalc = (peso * valorTon) - desconto;
    freteLiquido.value = freteLiquidoCalc.toFixed(2);

    const saldoCalc = freteLiquidoCalc - adiant;
    saldoFrete.value = saldoCalc.toFixed(2);

    // 🔹 ATUALIZAR COMISSÃO
    const motoristas = JSON.parse(localStorage.getItem("motoristas")) || [];
    const motoristaSelecionado = motoristas.find(m => m.nome === motorista.value);

    if (motoristaSelecionado) {
        calcularComissaoMotorista(motoristaSelecionado.comissao);
    }
}

function calcularComissaoMotorista(percentual) {
    const freteLiquidoCalc = parseFloat(freteLiquido.value) || 0;

    const valorComissao = (freteLiquidoCalc * percentual) / 100;
    comissao.value = valorComissao.toFixed(2);
}
// eventos
pesoCarregado.addEventListener("input", calcularFrete);
valorPorTonelada.addEventListener("input", calcularFrete);
descontoFrete.addEventListener("input", calcularFrete);
adiantamento.addEventListener("input", calcularFrete);

// Mostrar / ocultar campos
checkboxEstadia.addEventListener("change", () => {
    if (checkboxEstadia.checked) {
        valorEstadiaInput.style.display = "block";
        valor30Input.style.display = "block";
    } else {
        valorEstadiaInput.style.display = "none";
        valor30Input.style.display = "none";
        valorEstadiaInput.value = "";
        valor30Input.value = "";
    }
});

// Calcular 30%
valorEstadiaInput.addEventListener("input", () => {
    const valor = parseFloat(valorEstadiaInput.value) || 0;
    valor30Input.value = (valor * 0.3).toFixed(2);
});
// Listar viagens
function listarViagens() {
    let viagens = JSON.parse(localStorage.getItem("viagens")) || [];
    const filtroMes = document.getElementById("filtroMes")?.value || "";

    listaViagens.innerHTML = "";

    // FILTRAR POR MÊS SE SELECIONADO
    if (filtroMes) {
        viagens = viagens.filter(v => v.mes === filtroMes);
    }

    viagens.forEach(v => {
        listaViagens.innerHTML += `
        <tr>
            <td>${v.codigo}</td>
            <td>${v.data}</td>
            <td>${v.motorista}</td>
            <td>${v.placa}</td>
            <td style="text-align:center">
                <input 
                    type="checkbox" 
                    ${v.acertada ? "checked" : ""} 
                    onchange="toggleAcertada(${v.id}, this.checked)"
                >
            </td>
            <td>
                <button onclick="editarViagem(${v.id})">Editar</button>
                <button onclick="excluirViagem(${v.id})">Excluir</button>
                <button onclick="abrirLancamentos(${v.id})">Lançamentos</button>
            </td>
        </tr>`;
    });
}

document.getElementById("filtroMes").addEventListener("change", listarViagens);

function limparFiltroMes() {
    document.getElementById("filtroMes").value = "";
    listarViagens();
}

let viagemEmEdicao = null;

// EDITAR
function editarViagem(id) {
    let viagens = JSON.parse(localStorage.getItem("viagens"));
    viagemEmEdicao = viagens.find(v => v.id === id);

    data.value = viagemEmEdicao.data;
    motorista.value = viagemEmEdicao.motorista;
    placa.value = viagemEmEdicao.placa;
    origem.value = viagemEmEdicao.origem;
    destino.value = viagemEmEdicao.destino;
    frete.value = viagemEmEdicao.frete;

    // Estadia
    checkboxEstadia.checked = viagemEmEdicao.estadia || false;
    checkboxEstadia.dispatchEvent(new Event("change"));
    valorEstadiaInput.value = viagemEmEdicao.valorEstadia || "";
    valor30Input.value = viagemEmEdicao.valorEstadia30 || "";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// EXCLUIR
function excluirViagem(id) {
    if (!confirm("Deseja realmente excluir esta viagem?")) return;

    let viagens = JSON.parse(localStorage.getItem("viagens"));
    viagens = viagens.filter(v => v.id !== id);

    localStorage.setItem("viagens", JSON.stringify(viagens));
    listarViagens();

    alert("Viagem excluída com sucesso!");
}
// Abrir lançamentos
function abrirLancamentos(id) {
    let viagens = JSON.parse(localStorage.getItem("viagens"));
    viagemSelecionada = viagens.find(v => v.id === id);

    tituloLancamentos.innerText = `Lançamentos da Viagem ${viagemSelecionada.codigo}`;
    document.getElementById("lancamentos").style.display = "block";

    listarDespesas();
    listarAbastecimentos();
    listarRecebimentos();
    listarPedagios();
    listarVales();
}
// Salvar lançamentos
function salvarLancamento(e, tipo) {
    e.preventDefault();

    const valores = [...e.target.querySelectorAll("input, select")].map(i => i.value);

    if (lancamentoEmEdicao && lancamentoEmEdicao.tipo === tipo) {
        viagemSelecionada[tipo][lancamentoEmEdicao.index] = valores;
        lancamentoEmEdicao = null;
    } else {
        viagemSelecionada[tipo].push(valores);
    }

    salvarViagemAtual();
    e.target.reset();
    atualizarTabelas();

    alert("Lançamento salvo!");
}


// Controle de abas
function abrirAba(id, botao) {
    document.querySelectorAll(".tab-content").forEach(d => d.classList.remove("active"));
    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));

    document.getElementById(id).classList.add("active");
    botao.classList.add("active");
}

/* ================================
   CÁLCULO AUTOMÁTICO ABASTECIMENTO
================================ */

// Campos do formulário de abastecimento
const litrosInput = document.getElementById("litros");
const valorLitroInput = document.getElementById("valorLitro");
const totalInput = document.getElementById("total");

function calcularTotalAbastecimento() {
    const litros = parseFloat(litrosInput.value) || 0;
    const valorLitro = parseFloat(valorLitroInput.value) || 0;
    totalInput.value = (litros * valorLitro).toFixed(2);
}

// Eventos de cálculo automático
litrosInput.addEventListener("input", calcularTotalAbastecimento);
valorLitroInput.addEventListener("input", calcularTotalAbastecimento);

listarViagens();

/* ================================
   Tabelas dos lançamentos
================================ */
function listarDespesas() {
    const tbody = document.getElementById("listaDespesas");
    tbody.innerHTML = "";

    viagemSelecionada.despesas.forEach((d, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${d[0]}</td>
                <td>${d[1]}</td>
                <td>R$ ${Number(d[2]).toFixed(2)}</td>
                <td>${d[3]}</td>
                <td>
                    <button onclick="editarLancamento('despesas', ${index})">Editar</button>
                    <button onclick="excluirLancamento('despesas', ${index})">Excluir</button>
                </td>
            </tr>
        `;
    });
}



function listarAbastecimentos() {
    const tbody = document.getElementById("listaAbastecimentos");
    tbody.innerHTML = "";

    viagemSelecionada.abastecimentos.forEach((a, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${a[0]}</td> <!-- Data -->
                <td>${a[1]}</td> <!-- Posto -->
                <td>${a[2]}</td> <!-- Km -->
                <td>${a[3]}</td> <!-- Tipo -->
                <td>${a[4]}</td> <!-- Litros -->
                <td>R$ ${Number(a[5]).toFixed(2)}</td> <!-- R$/Litro -->
                <td>${a[6]}</td> <!-- Forma Pagamento -->
                <td>R$ ${Number(a[7]).toFixed(2)}</td> <!-- Total -->
                <td>
                    <button onclick="editarLancamento('abastecimentos', ${index})">Editar</button>
                    <button onclick="excluirLancamento('abastecimentos', ${index})">Excluir</button>
                </td>
            </tr>
        `;
    });
}


function listarRecebimentos() {
    const tbody = document.getElementById("listaRecebimentos");
    tbody.innerHTML = "";

    viagemSelecionada.recebimentos.forEach((r, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${r[0]}</td> <!-- Data -->
                <td>R$ ${Number(r[1]).toFixed(2)}</td> <!-- Valor -->
                <td>${r[2]}</td> <!-- Tipo de Pagamento -->
                <td>${r[3] ? r[3] : "-"}</td> <!-- Nº do Cheque -->
                <td>
                    <button onclick="editarLancamento('recebimentos', ${index})">Editar</button>
                    <button onclick="excluirLancamento('recebimentos', ${index})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function listarPedagios() {
    const tbody = document.getElementById("listaPedagios");
    tbody.innerHTML = "";

    viagemSelecionada.pedagios.forEach((p, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${p[0]}</td>
                <td>R$ ${Number(p[1]).toFixed(2)}</td>
                <td>${p[2]}</td>
                <td>${p[3]}</td>
                <td>
                    <button onclick="editarLancamento('pedagios', ${index})">Editar</button>
                    <button onclick="excluirLancamento('pedagios', ${index})">Excluir</button>
                </td>
            </tr>
        `;
    });
}
function listarVales() {
    const tbody = document.getElementById("listaVales");
    tbody.innerHTML = "";

    viagemSelecionada.vales.forEach((v, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${v[0]}</td>
                <td>R$ ${Number(v[1]).toFixed(2)}</td>
                <td>
                    <button onclick="editarLancamento('vales', ${index})">Editar</button>
                    <button onclick="excluirLancamento('vales', ${index})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

/* ================================
  CHEQUES
================================ */
function toggleCheque() {
    const tipo = document.getElementById("tipoRecebimento").value;
    const campoCheque = document.getElementById("numeroCheque");

    if (tipo === "CHEQUE") {
        campoCheque.style.display = "block";
        campoCheque.required = true;
    } else {
        campoCheque.style.display = "none";
        campoCheque.required = false;
        campoCheque.value = "";
    }
}


/* ================================
  EDIÇÃO OU EXCLUSÃO DE VIAGENS
================================ */
function excluirLancamento(tipo, index) {
    if (!confirm("Deseja excluir este lançamento?")) return;

    viagemSelecionada[tipo].splice(index, 1);

    salvarViagemAtual();
    atualizarTabelas();
}

let lancamentoEmEdicao = null;

function editarLancamento(tipo, index) {
    lancamentoEmEdicao = { tipo, index };

    const dados = viagemSelecionada[tipo][index];
    const form = document.querySelector(`#${tipo} form`);
    const campos = form.querySelectorAll("input, select");

    campos.forEach((c, i) => c.value = dados[i]);

    form.scrollIntoView({ behavior: "smooth" });
}

function salvarLancamento(e, tipo) {
    e.preventDefault();

    const valores = [...e.target.querySelectorAll("input, select")].map(i => i.value);

    if (lancamentoEmEdicao && lancamentoEmEdicao.tipo === tipo) {
        viagemSelecionada[tipo][lancamentoEmEdicao.index] = valores;
        lancamentoEmEdicao = null;
    } else {
        viagemSelecionada[tipo].push(valores);
    }

    salvarViagemAtual();
    e.target.reset();
    atualizarTabelas();

    alert("Lançamento salvo!");
}

function salvarViagemAtual() {
    let viagens = JSON.parse(localStorage.getItem("viagens"));
    let index = viagens.findIndex(v => v.id === viagemSelecionada.id);
    viagens[index] = viagemSelecionada;
    localStorage.setItem("viagens", JSON.stringify(viagens));
}

function atualizarTabelas() {
    listarDespesas();
    listarAbastecimentos();
    listarRecebimentos();
    listarPedagios();
    listarVales();
}

/* ================================
  Gerar Relatorio
================================ */
function gerarRelatorio() {

    // ===== VARIÁVEIS DE CONTROLE =====
    let totalDespesas = 0;
    let totalAbastecimento = 0;
    let totalRecebido = 0;
    let totalPedagios = 0;

    let totalPagoDespesas = 0;
    let totalPagoAbastecimentos = 0;
    let totalPedagioDinheiro = 0;

    let html = `
    <html>
    <head>
        <title>Relatório da Viagem</title>
        <style>
            body { font-family: Arial; padding: 20px; }
            h2 { border-bottom: 2px solid #000; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #000; padding: 6px; }
            th { background: #eee; }
        </style>
    </head>
    <body>

    <h1>Relatório da Viagem</h1>

<p><strong>Motorista:</strong> ${viagemSelecionada.motorista}</p>
<p><strong>Placa:</strong> ${viagemSelecionada.placa}</p>
<p><strong>Transportadora:</strong> ${viagemSelecionada.transportadora}</p>

<p><strong>Origem:</strong> ${viagemSelecionada.origem}</p>
<p><strong>Destino:</strong> ${viagemSelecionada.destino}</p>

<p><strong>R$ Líquido do Frete:</strong> R$ ${Number(viagemSelecionada.freteLiquido).toFixed(2)}</p>
<p><strong>Adiantamento:</strong> R$ ${Number(viagemSelecionada.adiantamento).toFixed(2)}</p>
<p><strong>Saldo do Frete:</strong> R$ ${Number(viagemSelecionada.saldoFrete).toFixed(2)}</p>


    <hr>
    `;

    /* ================= DESPESAS ================= */
    html += `
    <h2>Despesas</h2>
    <table>
        <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Pagamento</th>
        </tr>
    `;

    viagemSelecionada.despesas.forEach(d => {
        totalDespesas += Number(d[2]);

        if (d[3] === "PAGO") {
            totalPagoDespesas += Number(d[2]);
        }

        html += `
        <tr>
            <td>${d[0]}</td>
            <td>${d[1]}</td>
            <td>R$ ${Number(d[2]).toFixed(2)}</td>
            <td>${d[3]}</td>
        </tr>`;
    });

    html += `
        <tr>
            <th colspan="2">TOTAL DESPESAS</th>
            <th colspan="2">R$ ${totalDespesas.toFixed(2)}</th>
        </tr>
    </table>
    `;

    /* ================= ABASTECIMENTOS ================= */
    html += `
    <h2>Abastecimentos</h2>
    <table>
        <tr>
            <th>Data</th>
            <th>Posto</th>
            <th>KM</th>
            <th>Tipo</th>
            <th>Litros</th>
            <th>R$/Litro</th>
            <th>Pagamento</th>
            <th>Total</th>
        </tr>
    `;

    viagemSelecionada.abastecimentos.forEach(a => {
        totalAbastecimento += Number(a[7]);

        if (a[6] === "PAGO") {
            totalPagoAbastecimentos += Number(a[7]);
        }

        html += `
        <tr>
            <td>${a[0]}</td>
            <td>${a[1]}</td>
            <td>${a[2]}</td>
            <td>${a[3]}</td>
            <td>${a[4]}</td>
            <td>R$ ${Number(a[5]).toFixed(2)}</td>
            <td>${a[6]}</td>
            <td>R$ ${Number(a[7]).toFixed(2)}</td>
        </tr>`;
    });

    html += `
        <tr>
            <th colspan="7">TOTAL ABASTECIMENTO</th>
            <th>R$ ${totalAbastecimento.toFixed(2)}</th>
        </tr>
    </table>
    `;

    /* ================= RECEBIMENTOS ================= */
    html += `
    <h2>Recebimentos</h2>
    <table>
        <tr>
            <th>Data</th>
            <th>Valor</th>
            <th>Forma</th>
            <th>Cheque</th>
        </tr>
    `;

    viagemSelecionada.recebimentos.forEach(r => {
        totalRecebido += Number(r[1]);

        html += `
        <tr>
            <td>${r[0]}</td>
            <td>R$ ${Number(r[1]).toFixed(2)}</td>
            <td>${r[2]}</td>
            <td>${r[3] || "-"}</td>
        </tr>`;
    });

    html += `
        <tr>
            <th>TOTAL RECEBIDO</th>
            <th colspan="3">R$ ${totalRecebido.toFixed(2)}</th>
        </tr>
    </table>
    `;

    /* ================= PEDÁGIOS ================= */
    html += `
    <h2>Pedágios</h2>
    <table>
        <tr>
            <th>Data</th>
            <th>Valor</th>
            <th>Pagamento</th>
            <th>Tipo</th>
        </tr>
    `;

    viagemSelecionada.pedagios.forEach(p => {
        totalPedagios += Number(p[1]);

        if (p[2] === "DINHEIRO") {
            totalPedagioDinheiro += Number(p[1]);
        }

        html += `
        <tr>
            <td>${p[0]}</td>
            <td>R$ ${Number(p[1]).toFixed(2)}</td>
            <td>${p[2]}</td>
            <td>${p[3]}</td>
        </tr>`;
    });

    html += `
        <tr>
            <th>TOTAL PEDÁGIOS</th>
            <th colspan="3">R$ ${totalPedagios.toFixed(2)}</th>
        </tr>
    </table>
    `;

    /* ===============================
   VALORES A RECEBER
================================ */

// ===============================
// COMISSÃO CORRETA DO MOTORISTA
// ===============================

// Buscar percentual do motorista
const motoristas = JSON.parse(localStorage.getItem("motoristas")) || [];
const motoristaSelecionado = motoristas.find(
    m => m.nome === viagemSelecionada.motorista
);

const percentualComissao =
    motoristaSelecionado ? Number(motoristaSelecionado.comissao) : 0;

// Valores base
const freteLiquido = Number(viagemSelecionada.freteLiquido || 0);
const totalPedagiosValor = totalPedagios || 0;

// Comissão correta:
// (Líquido do Frete - Pedágios) x %
const comissao =
    ((freteLiquido - totalPedagiosValor) * percentualComissao) / 100;


// Estadia
const totalEstadia = Number(viagemSelecionada.valorEstadia30 || 0);

// Comissão completa
const comissaoCompleta = comissao + totalEstadia;

// Total de vales (se existir array de vales)
let totalVales = 0;
if (viagemSelecionada.vales) {
    viagemSelecionada.vales.forEach(v => {
        totalVales += Number(v[1] || 0);
    });
}


const valorAdiantado = Number(viagemSelecionada.valorAdiantado || 0);

const valorAReceber =
    comissaoCompleta - valorAdiantado - totalVales;

    
    /* ================= MÉDIAS ================= */

// KM rodados
const kmRodados =
    (Number(viagemSelecionada.kmFinal) || 0) -
    (Number(viagemSelecionada.kmInicial) || 0);

// Litros abastecidos apenas DIESEL
let litrosDiesel = 0;
viagemSelecionada.abastecimentos.forEach(a => {
    if (a[3] === "DIESEL") {
        litrosDiesel += Number(a[4]);
    }
});

// Média de consumo
const media = litrosDiesel > 0 ? (kmRodados / litrosDiesel) : 0;

// Comissão original do motorista
const comissaoOriginal = Number(viagemSelecionada.comissao) || 0;

// Comissão com desconto dos pedágios
const comissaoLiquida = comissaoOriginal - totalPedagios;



    html += `
<h2>Dados do Frete</h2>
<p><strong>Peso Carregado:</strong> ${viagemSelecionada.pesoCarregado} t</p>
<p><strong>R$ por Tonelada:</strong> R$ ${Number(viagemSelecionada.valorPorTonelada).toFixed(2)}</p>


`;
// ================= ESTADIA =================
let valorEstadia = 0;
let valorEstadia30 = 0;

if (viagemSelecionada.estadia) {
    valorEstadia = Number(viagemSelecionada.valorEstadia) || 0;
    valorEstadia30 = Number(viagemSelecionada.valorEstadia30) || 0;
}

// ================= NOTAS (GASTOS) =================
const notas =
    totalPagoDespesas +
    totalPagoAbastecimentos +
    totalPedagioDinheiro;

// ================= FRETE TOTAL =================
const freteTotal =
    Number(viagemSelecionada.freteLiquido || 0) +
    valorEstadia;

// ================= SOBRA =================
const sobra = freteTotal - notas;



    /* ================= RESUMO FINAL ================= */
    const gastoMotorista =
    totalPagoDespesas +
    totalPagoAbastecimentos +
    totalPedagioDinheiro;
    

    const resultadoFinal =
    totalRecebido -
    totalDespesas -
    totalAbastecimento -
    totalPedagios;
   

    html += `
<h2>Resumo Financeiro</h2>

<p><strong>Frete Total:</strong>
R$ ${freteTotal.toFixed(2)}
</p>

<p><strong>Notas:</strong>
R$ ${notas.toFixed(2)}
</p>

<p><strong>Sobra:</strong>
R$ ${sobra.toFixed(2)}
</p>

<p><strong>Total de Cheques:</strong>
R$ ${totalRecebido.toFixed(2)}
</p>

<p><strong>Valor Adiantado (Comissão):</strong>
R$ ${valorAdiantado.toFixed(2)}
</p>
    
    
    

    
${viagemSelecionada.estadia ? `
<p><strong>Estadia:</strong> R$ ${valorEstadia.toFixed(2)}</p>
<p><strong>30% da Estadia:</strong> R$ ${valorEstadia30.toFixed(2)}</p>
` : ""}
;




   
   
    <h2>Médias da Viagem</h2>
<p><strong>KM Rodados:</strong> ${kmRodados} km</p>
<p><strong>Litros Abastecidos (Diesel):</strong> ${litrosDiesel.toFixed(2)} L</p>
<p><strong>Média:</strong> ${media.toFixed(2)} km/L</p>


    <script>window.print()</script>
    </body>
    </html>
    `;
    html += `
<h2>Valores a Receber</h2>

<p>
<strong>Comissão:</strong>
R$ ${comissao.toFixed(2)}
</p>

<p>
<strong>Comissão Completa (Comissão + Estadia):</strong>
R$ ${comissaoCompleta.toFixed(2)}
</p>

<p>
<strong>Total de Vales:</strong>
R$ ${totalVales.toFixed(2)}
</p>

<p>
<strong>Valor a Receber:</strong>
R$ ${valorAReceber.toFixed(2)}
</p>
`;


    const janela = window.open("", "_blank");
    janela.document.write(html);
    janela.document.close();
}


 /* ================= CADASTRO MOTORISTAS ================= */
const nascimentoMotorista = document.getElementById("nascimentoMotorista");
const idadeMotorista = document.getElementById("idadeMotorista");

nascimentoMotorista.addEventListener("change", () => {
    const nascimento = new Date(nascimentoMotorista.value);
    const hoje = new Date();

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }

    idadeMotorista.value = idade;
});

/* ================= CADASTRO MOTORISTAS (SALVAR) ================= */
document.getElementById("formMotorista").addEventListener("submit", e => {
    e.preventDefault();

    let motoristas = JSON.parse(localStorage.getItem("motoristas")) || [];

    motoristas.push({
        id: Date.now(),
        nome: nomeMotorista.value,
        telefone: telefoneMotorista.value,
        cpf: cpfMotorista.value,
        nascimento: nascimentoMotorista.value,
        idade: idadeMotorista.value,
        comissao: comissaoMotorista.value,
        pamcard: pamcardMotorista.motorista
    });

    localStorage.setItem("motoristas", JSON.stringify(motoristas));

    e.target.reset();
    listarMotoristas();
    carregarMotoristasNoSelect();

    alert("Motorista cadastrado com sucesso!");
});
/* ================= LISTA DE MOTORISTAS ================= */
function listarMotoristas() {
    const tbody = document.getElementById("listaMotoristas");
    tbody.innerHTML = "";

    let motoristas = JSON.parse(localStorage.getItem("motoristas")) || [];

    motoristas.forEach((m, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${m.nome}</td>
                <td>${m.telefone}</td>
                <td>${m.cpf}</td>
                <td>${m.idade}</td>
                <td>${m.comissao}%</td>
                <td>${m.pamcard || "-"}</td>
                <td>
                    <button onclick="editarMotorista(${index})">Editar</button>
                    <button onclick="excluirMotorista(${index})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function editarMotorista(index) {
    let motoristas = JSON.parse(localStorage.getItem("motoristas")) || [];
    motoristaEmEdicao = index;
    const m = motoristas[index];

    nomeMotorista.value = m.nome;
    telefoneMotorista.value = m.telefone;
    cpfMotorista.value = m.cpf;
    nascimentoMotorista.value = m.nascimento;
    idadeMotorista.value = m.idade;
    comissaoMotorista.value = m.comissao;
    pamcardMotorista.value = m.pamcard || "";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function excluirMotorista(index) {
    if (!confirm("Deseja excluir este motorista?")) return;

    let motoristas = JSON.parse(localStorage.getItem("motoristas")) || [];
    motoristas.splice(index, 1);

    localStorage.setItem("motoristas", JSON.stringify(motoristas));
    listarMotoristas();
    carregarMotoristasNoSelect();

    alert("Motorista excluído!");
}

/* ================= CARREGAR OS MOTORISTAS ================= */
function carregarMotoristasNoSelect() {
    const select = document.getElementById("motorista");
    select.innerHTML = `<option carregarMotoristasNoSelect()="">Selecione o Motorista</option>`;

    let motoristas = JSON.parse(localStorage.getItem("motoristas")) || [];

    motoristas.forEach(m => {
        select.innerHTML += `
            <option value="${m.nome}">
                ${m.nome}
            </option>
        `;
    });
}

listarMotoristas();
carregarMotoristasNoSelect();
// ================================
// PUXAR COMISSÃO DO MOTORISTA
// ================================
document.getElementById("motorista").addEventListener("change", () => {
    const nomeSelecionado = motorista.value;
    if (!nomeSelecionado) return;

    const motoristas = JSON.parse(localStorage.getItem("motoristas")) || [];
    const motoristaSelecionado = motoristas.find(m => m.nome === nomeSelecionado);

    if (!motoristaSelecionado) return;

    calcularComissaoMotorista(motoristaSelecionado.comissao);
});


/*=====================Minimizar e maximizar===================*/
function toggleMotoristas() {
    const conteudo = document.getElementById("conteudoMotoristas");
    const botao = document.getElementById("btnToggleMotorista");

    if (conteudo.style.display === "none") {
        conteudo.style.display = "block";
        botao.innerText = "Minimizar";
    } else {
        conteudo.style.display = "none";
        botao.innerText = "Maximizar";
    }
}

//*=======Veiculos cadastro======*//
document.getElementById("formVeiculo").addEventListener("submit", e => {
    e.preventDefault();

    let veiculos = JSON.parse(localStorage.getItem("veiculos")) || [];

    veiculos.push({
        id: Date.now(),
        marca: marcaVeiculo.value,
        modelo: modeloVeiculo.value,
        placa: placaVeiculo.value
    });

    localStorage.setItem("veiculos", JSON.stringify(veiculos));

    e.target.reset();
    listarVeiculos();
    carregarPlacasVeiculos(); // 👈 ESSENCIAL

    alert("Veículo cadastrado com sucesso!");
});

function listarVeiculos() {
    const tbody = document.getElementById("listaVeiculos");
    tbody.innerHTML = "";

    let veiculos = JSON.parse(localStorage.getItem("veiculos")) || [];

    veiculos.forEach((v, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${v.marca}</td>
                <td>${v.modelo}</td>
                <td>${v.placa}</td>
                <td>
                    <button onclick="editarVeiculo(${index})">Editar</button>
                    <button onclick="excluirVeiculo(${index})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function editarVeiculo(index) {
    let veiculos = JSON.parse(localStorage.getItem("veiculos")) || [];
    veiculoEmEdicao = index;
    const v = veiculos[index];

    marcaVeiculo.value = v.marca;
    modeloVeiculo.value = v.modelo;
    placaVeiculo.value = v.placa;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function excluirVeiculo(index) {
    if (!confirm("Deseja excluir este veículo?")) return;

    let veiculos = JSON.parse(localStorage.getItem("veiculos")) || [];
    veiculos.splice(index, 1);

    localStorage.setItem("veiculos", JSON.stringify(veiculos));
    listarVeiculos();
    carregarPlacasVeiculos();

    alert("Veículo excluído!");
}

listarVeiculos();
function toggleVeiculos() {
    const conteudo = document.getElementById("conteudoVeiculos");
    const botao = document.getElementById("btnToggleVeiculos");

    if (conteudo.style.display === "none") {
        conteudo.style.display = "block";
        botao.innerText = "Minimizar";
    } else {
        conteudo.style.display = "none";
        botao.innerText = "Maximizar";
    }
}

function carregarPlacasVeiculos() {
    const selectPlaca = document.getElementById("placa");
    if (!selectPlaca) return;

    selectPlaca.innerHTML = `<option value="">Selecione a Placa</option>`;

    const veiculos = JSON.parse(localStorage.getItem("veiculos")) || [];

    veiculos.forEach(v => {
        const option = document.createElement("option");
        option.value = v.placa;
        option.textContent = `${v.placa} - ${v.modelo}`;
        selectPlaca.appendChild(option);
    });
}
document.addEventListener("DOMContentLoaded", () => {
    carregarPlacasVeiculos();
});


