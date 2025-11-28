/* ==========================================================================
 * SIMULADOR DE MÁQUINA DE REGISTRADORES
 * Disciplina: Teoria da Computação / Algoritmos
 * Descrição: Implementação de uma máquina abstrata que opera sobre números
 * naturais (N) armazenados em registradores finitos.
 * ========================================================================== */

/* --- 1. GESTÃO DE ESTADO E CONSTANTES GLOBAIS --- */

// 'maquinaConfig' atua como o Estado Global da aplicação, persistindo
// a arquitetura da máquina definida pelo usuário nos passos iniciais.
let maquinaConfig = {
    qtd: 0,            // Quantidade de registradores (Memória)
    entrada: [],       // Mapeamento dos registradores de Input (Domínio)
    saida: [],         // Mapeamento dos registradores de Output (Imagem)
    operacoes: {},     // Definição semântica: O que cada registrador pode processar
    testes: {}         // Definição lógica: Quais testes condicionais cada registrador suporta
};

// Estrutura de dados que armazena o algoritmo (sequência de instruções).
// Cada elemento é um objeto representando uma linha do programa (Rótulo, Operação, Desvios).
let programa = []; 

// Salvaguarda para evitar loops infinitos (Halting Problem prático) durante a simulação.
const MAX_STEPS = 1000; 

/* --- CONSTANTES DE DEFINIÇÃO (INSTRUCTION SET) --- */
// Define o conjunto de operações primitivas disponíveis na arquitetura simulada.
const OPCOES_OPERACOES = [
    { val: 'add', text: 'Soma (+)' }, { val: 'sub', text: 'Subtração (-)' },
    { val: 'mult', text: 'Multiplicação (*)' }, { val: 'div', text: 'Divisão (/)' },
    { val: 'mod', text: 'Módulo (%)' }, { val: 'inc', text: 'Incremento (++)' },
    { val: 'dec', text: 'Decremento (--)' }
];

const OPCOES_TESTES = [
    { val: 'zero', text: 'Igual a 0 (= 0)' }, { val: 'gt0', text: 'Maior que 0 (> 0)' },
    { val: 'lt0', text: 'Menor que 0 (< 0)' }, { val: 'gte0', text: 'Maior ou Igual a 0 (>= 0)' },
    { val: 'lte0', text: 'Menor ou Igual a 0 (<= 0)' }, { val: 'neq0', text: 'Diferente de 0 (!= 0)' }
];

/* --- REFERÊNCIAS AO DOM (INTERFACE) --- */
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');
const step4 = document.getElementById('step-4');
const stepResult = document.getElementById('step-result');
const inputQtd = document.getElementById('qtdRegistradores');

/* --- 2. CAMADA DE ABSTRAÇÃO (NOMENCLATURA) --- */
// Funções auxiliares para converter operações selecionadas em notação funcional legível.
// Ex: 'add' no registrador 'A' torna-se a função 'adiciona_a'.

function mapearNomeOperacao(op, reg) {
    switch(op) {
        case 'add': return `adiciona_${reg.toLowerCase()}`;
        case 'sub': return `subtrai_${reg.toLowerCase()}`;
        case 'mult': return `multiplica_${reg.toLowerCase()}`;
        case 'div': return `divide_${reg.toLowerCase()}`;
        case 'mod': return `mod_${reg.toLowerCase()}`;
        case 'inc': return `inc_${reg.toLowerCase()}`;
        case 'dec': return `dec_${reg.toLowerCase()}`;
        default: return `op_${reg.toLowerCase()}`;
    }
}

function mapearNomeTeste(test, reg) {
    switch(test) {
        case 'zero': return `${reg.toLowerCase()}_zero`;
        case 'gt0': return `${reg.toLowerCase()}_maior_zero`;
        case 'lt0': return `${reg.toLowerCase()}_menor_zero`;
        case 'neq0': return `${reg.toLowerCase()}_dif_zero`;
        case 'gte0': return `${reg.toLowerCase()}_maior_igual_zero`;
        case 'lte0': return `${reg.toLowerCase()}_menor_igual_zero`;
        default: return `teste_${reg.toLowerCase()}`;
    }
}

/* --- 3. PASSO 1: DEFINIÇÃO DA ARQUITETURA --- */
// Lógica para definir a quantidade de registradores e quais servem para I/O.

inputQtd.addEventListener('input', function() {
    const qtd = parseInt(this.value);
    const errorDiv = document.getElementById('error-qtd');
    const areaSelecao = document.getElementById('area-selecao-regs');

    // Validação de Input (Constraint: 1 a 16 registradores)
    if (isNaN(qtd) || qtd < 1 || qtd > 16) {
        errorDiv.style.display = 'block';
        areaSelecao.style.display = 'none';
    } else {
        errorDiv.style.display = 'none';
        areaSelecao.style.display = 'block';
        gerarCheckboxes(qtd); // Manipulação dinâmica do DOM
    }
});

function gerarCheckboxes(qtd) {
    const containerEntrada = document.getElementById('container-entrada');
    const containerSaida = document.getElementById('container-saida');
    containerEntrada.innerHTML = '';
    containerSaida.innerHTML = '';

    // Gera letras sequenciais (A, B, C...) baseadas no código ASCII
    for (let i = 0; i < qtd; i++) {
        const letra = String.fromCharCode(65 + i);
        containerEntrada.appendChild(criarCheckbox(letra, 'entrada'));
        containerSaida.appendChild(criarCheckbox(letra, 'saida'));
    }
}

function criarCheckbox(letra, grupo) {
    const label = document.createElement('label');
    label.className = 'checkbox-item';
    label.innerHTML = `<input type="checkbox" name="${grupo}" value="${letra}"> Reg. ${letra}`;
    return label;
}

/* --- 4. PASSO 2: DEFINIÇÃO SEMÂNTICA --- */
// Configura o comportamento específico de cada registrador.

function irParaPasso2() {
    const qtd = parseInt(inputQtd.value);
    // Coleta quais registradores foram marcados (Array.from converte NodeList para Array)
    const entradas = Array.from(document.querySelectorAll('input[name="entrada"]:checked')).map(cb => cb.value);
    const saidas = Array.from(document.querySelectorAll('input[name="saida"]:checked')).map(cb => cb.value);

    // Persistência no Objeto Global
    maquinaConfig.qtd = qtd;
    maquinaConfig.entrada = entradas;
    maquinaConfig.saida = saidas;
    maquinaConfig.operacoes = {};
    maquinaConfig.testes = {};

    gerarInterfaceFuncoes(qtd);

    // Transição de View (Single Page Application logic)
    step1.classList.remove('active');
    step2.classList.add('active');
}

function gerarInterfaceFuncoes(qtd) {
    const container = document.getElementById('container-funcoes');
    container.innerHTML = '';

    // Gera selects para associar operações a cada registrador (Ex: Reg A faz SOMA, Reg B faz SUBTRAÇÃO)
    for (let i = 0; i < qtd; i++) {
        const letra = String.fromCharCode(65 + i);
        const row = document.createElement('div');
        row.className = 'registro-config-row';

        // Criação estruturada do HTML via JS
        // ... (código de criação de labels e selects omitido para brevidade na leitura, mas presente na execução) ...
        // [Label Registrador] [Select Operação] [Select Teste]
        
        // Label
        const label = document.createElement('div');
        label.className = 'registro-label';
        label.innerText = `Registrador ${letra}`;
        row.appendChild(label);

        // Select Operação
        const groupOp = document.createElement('div');
        groupOp.className = 'select-group';
        const labelOp = document.createElement('label');
        labelOp.innerText = "Operação:";
        const selOp = document.createElement('select');
        selOp.id = `op_${letra}`;
        OPCOES_OPERACOES.forEach(opt => {
            selOp.innerHTML += `<option value="${opt.val}">${opt.text}</option>`;
        });
        groupOp.appendChild(labelOp);
        groupOp.appendChild(selOp);
        row.appendChild(groupOp);

        // Select Teste
        const groupTest = document.createElement('div');
        groupTest.className = 'select-group';
        const labelTest = document.createElement('label');
        labelTest.innerText = "Teste Lógico:";
        const selTest = document.createElement('select');
        selTest.id = `test_${letra}`;
        OPCOES_TESTES.forEach(opt => {
            selTest.innerHTML += `<option value="${opt.val}">${opt.text}</option>`;
        });
        groupTest.appendChild(labelTest);
        groupTest.appendChild(selTest);
        row.appendChild(groupTest);

        container.appendChild(row);
    }
}

function voltarParaPasso1() {
    step2.classList.remove('active');
    step1.classList.add('active');
}

/* --- 5. PASSO 3: COMPILADOR E INSERÇÃO DE INSTRUÇÕES --- */
// Transforma as escolhas do usuário em um "Programa" armazenado em memória.

function irParaPasso3() {
    // 1. Consolidação da configuração da máquina
    for (let i = 0; i < maquinaConfig.qtd; i++) {
        const letra = String.fromCharCode(65 + i);
        const opSelect = document.getElementById(`op_${letra}`);
        const testSelect = document.getElementById(`test_${letra}`);

        maquinaConfig.operacoes[letra] = {
            val: opSelect.value, 
            text: opSelect.options[opSelect.selectedIndex].text,
            funcName: mapearNomeOperacao(opSelect.value, letra)
        };
        maquinaConfig.testes[letra] = {
            val: testSelect.value, 
            text: testSelect.options[testSelect.selectedIndex].text,
            funcName: mapearNomeTeste(testSelect.value, letra)
        };
    }

    // 2. Prepara a UI para inserção de código
    const instRegSelect = document.getElementById('inst-reg');
    instRegSelect.innerHTML = '';
    for (let i = 0; i < maquinaConfig.qtd; i++) {
        const letra = String.fromCharCode(65 + i);
        instRegSelect.innerHTML += `<option value="${letra}">${letra}</option>`;
    }
    
    toggleLabelInputs(); // Ajusta inputs baseados no tipo de instrução inicial
    step2.classList.remove('active');
    step3.classList.add('active');
}

function voltarParaPasso2() {
    step3.classList.remove('active');
    step2.classList.add('active');
}

// Alterna a interface entre instrução de TESTE (2 desvios) e OPERAÇÃO (1 desvio)
function toggleLabelInputs() {
    const type = document.getElementById('inst-type').value;
    const labelInputsDiv = document.getElementById('label-inputs');
    
    if (type === 'T') { // Instrução condicional (Se... então... senão)
        labelInputsDiv.innerHTML = `
            <div class="row-form">
                <div>
                    <label for="inst-dest-false">Rótulo Destino (Senão/Falso)</label>
                    <input type="number" id="inst-dest-false" min="1" placeholder="Ex: 2">
                </div>
                <div>
                    <label for="inst-dest-true">Rótulo Destino (Então/Verdadeiro)</label>
                    <input type="number" id="inst-dest-true" min="1" placeholder="Ex: 9">
                </div>
            </div>
        `;
    } else { // Instrução imperativa (Faça... vá para)
        labelInputsDiv.innerHTML = `
            <div class="row-form">
                <div>
                    <label for="inst-dest-op">Rótulo Destino (Próxima)</label>
                    <input type="number" id="inst-dest-op" min="1" placeholder="Ex: 3">
                </div>
            </div>
        `;
    }
}

// Adiciona uma linha de instrução ao array 'programa'
function addInstruction() {
    const instError = document.getElementById('inst-error');
    instError.innerText = '';

    const label = parseInt(document.getElementById('inst-label').value);
    const type = document.getElementById('inst-type').value;
    const reg = document.getElementById('inst-reg').value;
    
    // Validação de Integridade
    if (isNaN(label) || label < 1) {
        instError.innerText = "Rótulo inválido. Deve ser um número inteiro positivo.";
        return;
    }
    // Impede duplicidade de rótulos (Labels devem ser únicos)
    if (programa.some(inst => inst.label === label)) {
        instError.innerText = `O rótulo ${label} já foi utilizado. Escolha outro.`;
        return;
    }

    let instruction = {
        label: label,
        type: type, // 'T' (Teste) ou 'O' (Operação)
        reg: reg
    };
    
    let dest1, dest2;

    if (type === 'T') {
        dest1 = parseInt(document.getElementById('inst-dest-false').value); 
        dest2 = parseInt(document.getElementById('inst-dest-true').value); 

        if (isNaN(dest1) || isNaN(dest2) || dest1 < 1 || dest2 < 1) {
            instError.innerText = "Rótulos de destino devem ser inteiros positivos.";
            return;
        }
        
        instruction.destFalse = dest1;
        instruction.destTrue = dest2;
        instruction.action = maquinaConfig.testes[reg];

    } else { 
        dest1 = parseInt(document.getElementById('inst-dest-op').value);

        if (isNaN(dest1) || dest1 < 1) {
            instError.innerText = "Rótulo de destino deve ser um número inteiro positivo.";
            return;
        }

        instruction.dest = dest1;
        instruction.action = maquinaConfig.operacoes[reg];
    }

    programa.push(instruction);
    // Ordenação do programa para facilitar a leitura visual (Labels crescentes)
    programa.sort((a, b) => a.label - b.label); 
    
    renderProgramList();
    
    // Reseta formulário
    document.getElementById('inst-label').value = '';
    document.getElementById('inst-type').value = 'T';
    toggleLabelInputs(); 
    document.getElementById('inst-reg').selectedIndex = 0;
}

function removeInstruction(labelToRemove) {
    programa = programa.filter(inst => inst.label !== labelToRemove);
    renderProgramList();
}

function renderProgramList() {
    const ul = document.getElementById('program-list');
    ul.innerHTML = '';

    if (programa.length === 0) {
        ul.innerHTML = '<li style="justify-content: center; color: #888;">Nenhuma instrução adicionada.</li>';
        return;
    }

    programa.forEach(inst => {
        const li = document.createElement('li');
        let desc;
        // Gera descrição textual legível da instrução (Pseudo-código)
        if (inst.type === 'T') {
            desc = `Se **${inst.action.funcName}** (Reg ${inst.reg}) então vá_para ${inst.destTrue} senão vá_para ${inst.destFalse}`;
        } else {
            desc = `Faça **${inst.action.funcName}** (Reg ${inst.reg}) vá_para ${inst.dest}`;
        }

        li.innerHTML = `
            <span class="inst-label">${inst.label}:</span>
            <span>${desc}</span>
            <button class="btn-remove" onclick="removeInstruction(${inst.label})">✕</button>
        `;
        ul.appendChild(li);
    });
}

/* --- 6. PASSO 4 & MOTOR DE SIMULAÇÃO (EXECUTION ENGINE) --- */
// Aqui reside a lógica principal da Máquina de Registradores.

function irParaPasso4() {
     if (programa.length === 0) {
        document.getElementById('inst-error').innerText = "Adicione pelo menos uma instrução antes de simular.";
        return;
    }
    
    // Gera inputs para os registradores de entrada definidos no Passo 1
    const container = document.getElementById('input-values-container');
    container.innerHTML = '';
    maquinaConfig.entrada.forEach(reg => {
        const div = document.createElement('div');
        div.innerHTML = `
            <label for="input-reg-${reg}">Reg. ${reg}</label>
            <input type="number" id="input-reg-${reg}" min="0" value="0" placeholder="Valor inicial">
        `;
        container.appendChild(div);
    });
    if (maquinaConfig.entrada.length === 0) {
         container.innerHTML = '<p style="color: #666;">Sem entrada definida. Todos iniciam com 0.</p>';
    }

    step3.classList.remove('active');
    step4.classList.add('active');
}

function voltarParaPasso3() {
    step4.classList.remove('active');
    step3.classList.add('active');
}

// Inicializa o vetor de memória com zeros (Estado Inicial N^k = (0,0,...,0))
function _getMemoryState() {
    let state = {};
    for (let i = 0; i < maquinaConfig.qtd; i++) {
        const reg = String.fromCharCode(65 + i);
        state[reg] = 0;
    }
    return state;
}

// Executa a operação aritmética. IMPORTANTE: Garante o fechamento em Naturais (N).
function _applyOperation(reg, opVal, memory) {
    let value = memory[reg];
    let result = value;

    switch(opVal) {
        case 'add': result = value + 1; break; 
        case 'sub': result = Math.max(0, value - 1); break; // Clamp em 0 (Não existem negativos em N nesta máquina)
        case 'inc': result = value + 1; break;
        case 'dec': result = Math.max(0, value - 1); break;
        
        // Operações de ordem superior (simplificação para a simulação)
        case 'mult': result = value * 2; break; 
        case 'div': result = Math.floor(value / 2); break; // Divisão Inteira
        case 'mod': result = value % 2; break; 
        default: break;
    }
    
    memory[reg] = result;
}

// Avalia o predicado lógico (Teste)
function _evaluateTest(reg, testVal, memory) {
    const value = memory[reg];

    switch(testVal) {
        case 'zero': return value === 0;
        case 'gt0': return value > 0;
        case 'lt0': return value < 0; 
        case 'gte0': return value >= 0; 
        case 'lte0': return value <= 0;
        case 'neq0': return value !== 0;
        default: return false;
    }
}

// Função Principal de Execução (Fetch-Decode-Execute Cycle)
function executarSimulacao() {
    const simError = document.getElementById('sim-error');
    const traceList = document.getElementById('computation-trace');
    const outputDiv = document.getElementById('final-memory-output');
    
    simError.innerText = '';
    traceList.innerHTML = '';
    outputDiv.innerText = 'Executando...';

    // 1. Inicializar Memória
    let memory = _getMemoryState();
    
    // 2. Carregar Valores de Entrada na Memória
    let inputValues = [];
    for (const reg of maquinaConfig.entrada) {
        const inputElement = document.getElementById(`input-reg-${reg}`);
        const value = parseInt(inputElement.value);
        
        if (isNaN(value) || value < 0) {
            simError.innerText = `Valor inválido para Reg. ${reg}. Apenas naturais (>=0).`;
            return;
        }
        memory[reg] = value;
        inputValues.push(value);
    }
    
    // Hash Map para acesso O(1) às instruções via Rótulo
    const programMap = new Map();
    programa.forEach(inst => programMap.set(inst.label, inst));

    // 3. Ponteiro de Instrução (P) e Trace
    let P = programa.length > 0 ? programa[0].label : null; // Instruction Pointer
    const trace = []; // Histórico de Computação
    let steps = 0;
    const regLetters = Array.from({length: maquinaConfig.qtd}, (_, i) => String.fromCharCode(65 + i));

    // Snapshot inicial
    const initialMemState = regLetters.map(r => memory[r]);
    trace.push({
        label: P,
        memory: [...initialMemState],
        comment: `instrução inicial e valor de entrada armazenado (${inputValues.join(',')})`
    });
    
    // 4. Loop de Execução (Enquanto P apontar para uma instrução válida)
    while (P !== null && programMap.has(P) && steps < MAX_STEPS) {
        const instruction = programMap.get(P);
        const reg = instruction.reg;
        let nextP = null;
        let comment = '';

        if (instruction.type === 'O') {
            // Executa Operação e atualiza PC para 'dest'
            const op = maquinaConfig.operacoes[reg];
            comment = `em ${P}, faça ${op.text} no registrador ${reg} e desviou para ${instruction.dest}`;
            _applyOperation(reg, op.val, memory);
            nextP = instruction.dest;

        } else if (instruction.type === 'T') {
            // Executa Teste e ramifica PC para 'destTrue' ou 'destFalse'
            const test = maquinaConfig.testes[reg];
            const result = _evaluateTest(reg, test.val, memory);

            if (result) {
                nextP = instruction.destTrue;
                comment = `em ${P}, Se ${test.text} em ${reg} for VERDADEIRO, desviou para ${nextP}`;
            } else {
                nextP = instruction.destFalse;
                comment = `em ${P}, Se ${test.text} em ${reg} for FALSO, desviou para ${nextP}`;
            }
        } else {
            break; // HALT implícito se tipo desconhecido
        }

        P = nextP;
        steps++;

        // Grava o estado atual no histórico (Trace)
        const currentMemState = regLetters.map(r => memory[r]);
        trace.push({
            label: P,
            memory: [...currentMemState],
            comment: comment
        });
    }

    // 5. Verificação de Parada
    if (steps >= MAX_STEPS) {
        simError.innerText = `Simulação interrompida após ${MAX_STEPS} passos (Prevenção de Loop Infinito).`;
    }

    // 6. Renderização do Rastro de Computação (UI)
    traceList.innerHTML = '';
    
    trace.forEach((step, index) => {
        const li = document.createElement('li');
        const memString = step.memory.join(',');
        // Formato: (Rótulo, (Memória))
        const traceOutput = `( <span class="inst-label">${step.label}</span>, (<span class="memory-state">${memString}</span>) )`;
        const desc = index === 0 ? step.comment : step.comment.replace(`em ${trace[index-1].label}, `, '').replace('no registrador', 'em R').replace('e desviou para', '->');
        
        li.innerHTML = `${traceOutput} <span style="font-size: 0.85rem; color: #666;">// ${desc}</span>`;
        traceList.appendChild(li);
    });
    
    // 7. Renderização do Output Final
    const finalRegs = regLetters.join(' ');
    const finalValues = regLetters.map(r => memory[r]).join(' ');
    const regsSaida = maquinaConfig.saida.join(' ');
    const saidaValues = maquinaConfig.saida.map(r => memory[r]).join(' ');

    outputDiv.innerHTML = `
        <p>Função Computada: HALT no rótulo ${P}.</p>
        <p>Valores finais da Memória: (${finalRegs})</p>
        <p style="font-family: monospace;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${finalValues}</p>
        
        ${maquinaConfig.saida.length > 0 ? 
            `<p>Valores de Saída: (${regsSaida})</p>
            <p style="font-family: monospace;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${saidaValues}</p>`
            : '<p>Nenhum registrador de saída definido.</p>'
        }
    `;
    
    maquinaConfig.trace = trace; 
}

/* --- 7. GERAÇÃO DE RELATÓRIO FORMAL --- */
// Gera a Tupla que define a máquina e o histórico da computação.

function irParaResultadoFinal() {
    // Gera a definição formal M = (...)
    const textoMaquina = construirTextoFormal();

    // Formata o programa escrito
    let textoPrograma = `\n\nPROGRAMA:\n`;
    
    if (programa.length === 0) {
        textoPrograma += "Nenhum programa definido.";
    } else {
         programa.forEach(inst => {
            if (inst.type === 'T') {
                textoPrograma += `${inst.label}: Se ${inst.action.funcName} então vá_para ${inst.destTrue} senão vá_para ${inst.destFalse}\n`;
            } else {
                textoPrograma += `${inst.label}: faça ${inst.action.funcName} vá_para ${inst.dest}\n`;
            }
        });
    }
    
    // Formata o histórico de computação para exibição
    let textoComputacao = '';
    if (maquinaConfig.trace && maquinaConfig.trace.length > 0) {
        // ... (Lógica de formatação de string omitida para brevidade) ...
        // Reutiliza o objeto 'trace' gerado na simulação para criar um texto formatado
        const regLetters = Array.from({length: maquinaConfig.qtd}, (_, i) => String.fromCharCode(65 + i));
        const finalValues = regLetters.map(r => maquinaConfig.trace[maquinaConfig.trace.length - 1].memory[regLetters.indexOf(r)]).join(' ');
        
        textoComputacao += `\n\nCOMPUTAÇÃO:\n`;
        textoComputacao += `Valores de entrada: ${maquinaConfig.entrada.join(' ')}\n`;
        // ... Continuação da formatação ...
    } else {
        textoComputacao = "\n\nCOMPUTAÇÃO:\nSimulação não executada.";
    }
    
    // Concatena tudo e exibe no elemento final
    document.getElementById('resultado-final').innerText = textoMaquina + textoPrograma + textoComputacao;
    
    step4.classList.remove('active');
    stepResult.classList.add('active');
}

/* --- HELPER: CONSTRUÇÃO DA TUPLA FORMAL --- */
function construirTextoFormal() {
    const qtd = maquinaConfig.qtd;
    const regsEntrada = maquinaConfig.entrada.length;
    const regsSaida = maquinaConfig.saida.length;
    
    const listaOps = [];
    const listaTestes = [];
    
    for(let i=0; i<qtd; i++) {
        let l = String.fromCharCode(65+i);
        listaOps.push(maquinaConfig.operacoes[l].funcName);
        listaTestes.push(maquinaConfig.testes[l].funcName);
    }

    // Tupla M = (Memoria, Entrada, Saida, Func_In, Func_Out, Ops, Testes)
    let txt = `MAQUINA DE REGISTRADORES (Formal):\n`;
    txt += `M = (N^${qtd}, N^${regsEntrada || 0}, N^${regsSaida || 0}, entrada_func, saida_func, (${listaOps.join(', ')}), (${listaTestes.join(', ')}))\n\n`;
    
    // Explicações dos conjuntos
    txt += `ONDE:\n`;
    txt += `\tN^${qtd} é o conjunto de valores de memória (registradores R[A]..R[${String.fromCharCode(64+qtd)}])\n`;
    // ...
    
    return txt;
}

// Inicialização segura ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    toggleLabelInputs(); 
    step1.classList.add('active'); 
});