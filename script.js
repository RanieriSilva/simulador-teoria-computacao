/* --- VARIÁVEIS GLOBAIS --- */
let maquinaConfig = {
    qtd: 0,
    entrada: [],
    saida: [],
    operacoes: {}, // { 'A': { val: 'inc', text: 'Incremento (++)', funcName: 'inc_a' }, ... }
    testes: {}     // { 'A': { val: 'zero', text: 'Igual a 0 (= 0)', funcName: 'a_zero' }, ... }
};
let programa = []; // Armazena as instruções do programa
const MAX_STEPS = 1000; // Limite para evitar loop infinito na simulação

/* --- CONSTANTES DE OPÇÕES --- */
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

/* --- ELEMENTOS DOM --- */
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');
const step4 = document.getElementById('step-4');
const stepResult = document.getElementById('step-result');
const inputQtd = document.getElementById('qtdRegistradores');

/* --- FUNÇÕES AUXILIARES DE NOMEAÇÃO --- */

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

/* --- PASSO 1 LÓGICA --- */
inputQtd.addEventListener('input', function() {
    const qtd = parseInt(this.value);
    const errorDiv = document.getElementById('error-qtd');
    const areaSelecao = document.getElementById('area-selecao-regs');

    if (isNaN(qtd) || qtd < 1 || qtd > 16) {
        errorDiv.style.display = 'block';
        areaSelecao.style.display = 'none';
    } else {
        errorDiv.style.display = 'none';
        areaSelecao.style.display = 'block';
        gerarCheckboxes(qtd);
    }
});

function gerarCheckboxes(qtd) {
    const containerEntrada = document.getElementById('container-entrada');
    const containerSaida = document.getElementById('container-saida');
    containerEntrada.innerHTML = '';
    containerSaida.innerHTML = '';

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

/* --- PASSO 2 LÓGICA --- */

function irParaPasso2() {
    const qtd = parseInt(inputQtd.value);
    const entradas = Array.from(document.querySelectorAll('input[name="entrada"]:checked')).map(cb => cb.value);
    const saidas = Array.from(document.querySelectorAll('input[name="saida"]:checked')).map(cb => cb.value);

    // Salva no objeto global
    maquinaConfig.qtd = qtd;
    maquinaConfig.entrada = entradas;
    maquinaConfig.saida = saidas;
    maquinaConfig.operacoes = {};
    maquinaConfig.testes = {};

    // Gera interface do passo 2
    gerarInterfaceFuncoes(qtd);

    // Troca de tela
    step1.classList.remove('active');
    step2.classList.add('active');
}

function gerarInterfaceFuncoes(qtd) {
    const container = document.getElementById('container-funcoes');
    container.innerHTML = '';

    for (let i = 0; i < qtd; i++) {
        const letra = String.fromCharCode(65 + i);
        
        const row = document.createElement('div');
        row.className = 'registro-config-row';

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

/* --- PASSO 3 LÓGICA (Definição do Programa) --- */

function irParaPasso3() {
    // 1. Captura e Salva Funções
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

    // 2. Preenche Registradores disponíveis para Programação
    const instRegSelect = document.getElementById('inst-reg');
    instRegSelect.innerHTML = '';
    for (let i = 0; i < maquinaConfig.qtd; i++) {
        const letra = String.fromCharCode(65 + i);
        instRegSelect.innerHTML += `<option value="${letra}">${letra}</option>`;
    }
    
    // 3. Renderiza a parte de rótulos (padrão é Teste)
    toggleLabelInputs();

    // 4. Troca de tela
    step2.classList.remove('active');
    step3.classList.add('active');
}

function voltarParaPasso2() {
    step3.classList.remove('active');
    step2.classList.add('active');
}

function toggleLabelInputs() {
    const type = document.getElementById('inst-type').value;
    const labelInputsDiv = document.getElementById('label-inputs');
    
    if (type === 'T') { // Teste
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
    } else { // Operação
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

function addInstruction() {
    const instError = document.getElementById('inst-error');
    instError.innerText = '';

    const label = parseInt(document.getElementById('inst-label').value);
    const type = document.getElementById('inst-type').value;
    const reg = document.getElementById('inst-reg').value;
    
    if (isNaN(label) || label < 1) {
        instError.innerText = "Rótulo inválido. Deve ser um número inteiro positivo.";
        return;
    }

    // Checa se o rótulo já existe
    if (programa.some(inst => inst.label === label)) {
        instError.innerText = `O rótulo ${label} já foi utilizado. Escolha outro.`;
        return;
    }

    let instruction = {
        label: label,
        type: type, // 'T' ou 'O'
        reg: reg
    };
    
    let dest1, dest2;

    if (type === 'T') {
        dest1 = parseInt(document.getElementById('inst-dest-false').value); // FALSO
        dest2 = parseInt(document.getElementById('inst-dest-true').value);  // VERDADEIRO (Note: a lógica formal é se VAI para TRUE/FALSO)

        if (isNaN(dest1) || isNaN(dest2) || dest1 < 1 || dest2 < 1) {
            instError.innerText = "Rótulos de destino (Falso e Verdadeiro) devem ser números inteiros positivos.";
            return;
        }
        
        instruction.destFalse = dest1;
        instruction.destTrue = dest2;
        instruction.action = maquinaConfig.testes[reg];

    } else { // Operação 'O'
        dest1 = parseInt(document.getElementById('inst-dest-op').value);

        if (isNaN(dest1) || dest1 < 1) {
            instError.innerText = "Rótulo de destino deve ser um número inteiro positivo.";
            return;
        }

        instruction.dest = dest1;
        instruction.action = maquinaConfig.operacoes[reg];
    }

    programa.push(instruction);
    // Ordena o programa por rótulo
    programa.sort((a, b) => a.label - b.label); 
    
    renderProgramList();
    
    // Limpa o formulário (deixa apenas o rótulo em branco)
    document.getElementById('inst-label').value = '';
    document.getElementById('inst-type').value = 'T';
    toggleLabelInputs(); // Reseta os campos de destino
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
        if (inst.type === 'T') {
            // Ex: 1: Se a_zero então vá_para 9 senão va_para 2
            desc = `Se **${inst.action.funcName}** (Reg ${inst.reg}) então vá_para ${inst.destTrue} senão vá_para ${inst.destFalse}`;
        } else {
            // Ex: 2: faça subtrai_a vá_para 3
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

/* --- PASSO 4 LÓGICA (Simulação) --- */

function irParaPasso4() {
     if (programa.length === 0) {
        document.getElementById('inst-error').innerText = "Adicione pelo menos uma instrução ao programa antes de simular.";
        return;
    }
    
    // 1. Gera Inputs para Valores de Entrada
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
         container.innerHTML = '<p style="color: #666;">Não há registradores de entrada definidos (Passo 1). Todos os registradores começarão com zero.</p>';
    }


    // 2. Troca de tela
    step3.classList.remove('active');
    step4.classList.add('active');
}

function voltarParaPasso3() {
    step4.classList.remove('active');
    step3.classList.add('active');
}

function _getMemoryState() {
    let state = {};
    for (let i = 0; i < maquinaConfig.qtd; i++) {
        const reg = String.fromCharCode(65 + i);
        state[reg] = 0;
    }
    return state;
}

function _applyOperation(reg, opVal, memory) {
    let value = memory[reg];
    let result = value;

    // As operações aqui devem seguir as regras formais (geralmente em N, números naturais)
    // No nosso simulador, vamos garantir que o resultado seja >= 0 (clamp)

    switch(opVal) {
        case 'add': result = value + 1; break; // Simplificação: R(i) <- R(i) + 1 (Adiciona)
        case 'sub': result = Math.max(0, value - 1); break; // Simplificação: R(i) <- R(i) - 1 (Subtrai, com proteção contra negativo)
        case 'inc': result = value + 1; break;
        case 'dec': result = Math.max(0, value - 1); break;
        
        // Para operações mais complexas, assumimos que elas operam em R[reg]
        // e precisam de um segundo registrador implícito ou um valor constante.
        // Como não definimos o segundo operando, simplificamos:
        case 'mult': result = value * 2; break; // Ex: Multiplica por 2
        case 'div': result = Math.floor(value / 2); break; // Ex: Divide por 2 (inteiro)
        case 'mod': result = value % 2; break; // Ex: Módulo por 2
        default: break;
    }
    
    memory[reg] = result;
}

function _evaluateTest(reg, testVal, memory) {
    const value = memory[reg];

    switch(testVal) {
        case 'zero': return value === 0;
        case 'gt0': return value > 0;
        case 'lt0': return value < 0; // Se N, sempre Falso
        case 'gte0': return value >= 0; // Se N, sempre Verdadeiro
        case 'lte0': return value <= 0;
        case 'neq0': return value !== 0;
        default: return false;
    }
}

function executarSimulacao() {
    const simError = document.getElementById('sim-error');
    const traceList = document.getElementById('computation-trace');
    const outputDiv = document.getElementById('final-memory-output');
    
    simError.innerText = '';
    traceList.innerHTML = '';
    outputDiv.innerText = 'Executando...';

    // 1. Inicializar Memória (Todos a 0)
    let memory = _getMemoryState();
    
    // 2. Aplicar Valores de Entrada
    let inputValues = [];
    for (const reg of maquinaConfig.entrada) {
        const inputElement = document.getElementById(`input-reg-${reg}`);
        const value = parseInt(inputElement.value);
        
        if (isNaN(value) || value < 0) {
            simError.innerText = `Valor de entrada inválido para Reg. ${reg}. Deve ser um número inteiro não-negativo.`;
            return;
        }
        memory[reg] = value;
        inputValues.push(value);
    }
    
    // Mapear Programa para Busca Rápida
    const programMap = new Map();
    programa.forEach(inst => programMap.set(inst.label, inst));

    // 3. Inicializar Simulação
    let P = programa.length > 0 ? programa[0].label : null; // Rótulo inicial
    const trace = [];
    let steps = 0;
    const regLetters = Array.from({length: maquinaConfig.qtd}, (_, i) => String.fromCharCode(65 + i));

    // Log inicial (Computar - (P, (R[A], R[B]...)))
    const initialMemState = regLetters.map(r => memory[r]);
    trace.push({
        label: P,
        memory: [...initialMemState],
        comment: `instrução inicial e valor de entrada armazenado (${inputValues.join(',')})`
    });
    
    // 4. Loop de Execução
    while (P !== null && programMap.has(P) && steps < MAX_STEPS) {
        const instruction = programMap.get(P);
        const reg = instruction.reg;
        let nextP = null;
        let comment = '';

        if (instruction.type === 'O') {
            // Instrução de Operação (Faça...)
            const op = maquinaConfig.operacoes[reg];
            
            comment = `em ${P}, faça ${op.text} no registrador ${reg} e desviou para ${instruction.dest}`;
            _applyOperation(reg, op.val, memory);
            nextP = instruction.dest;

        } else if (instruction.type === 'T') {
            // Instrução de Teste (Se... Então... Senão...)
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
            // Rótulo inválido no map, deve ser HALT se o P for um destino.
            break;
        }

        P = nextP;
        steps++;

        const currentMemState = regLetters.map(r => memory[r]);
        trace.push({
            label: P,
            memory: [...currentMemState],
            comment: comment
        });
    }

    // 5. Finalizar Simulação
    if (steps >= MAX_STEPS) {
        simError.innerText = `Simulação interrompida após ${MAX_STEPS} passos para evitar loop infinito.`;
    }

    // 6. Exibir Trace
    traceList.innerHTML = '';
    
    // Cria um Map para mapear rótulos para comentários de execução (para o exemplo)
    const executionComments = {
        [trace[0].label]: 'instrução inicial e valor de entrada armazenado'
    };

    trace.forEach((step, index) => {
        const li = document.createElement('li');
        const memString = step.memory.join(',');
        const traceOutput = `( <span class="inst-label">${step.label}</span>, (<span class="memory-state">${memString}</span>) )`;
        
        // Limita a descrição para ser mais concisa
        const desc = index === 0 ? step.comment : step.comment.replace(`em ${trace[index-1].label}, `, '').replace('no registrador', 'em R').replace('e desviou para', '->');
        
        li.innerHTML = `${traceOutput} <span style="font-size: 0.85rem; color: #666;">// ${desc}</span>`;
        traceList.appendChild(li);
    });
    
    // 7. Exibir Saída Final
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
    
    // Guarda o trace para o resultado final
    maquinaConfig.trace = trace; 
}

/* --- GERAÇÃO FINAL DO TEXTO (Passo Resultado) --- */

function irParaResultadoFinal() {
     // 1. Montar Texto Formal (Máquina)
    const textoMaquina = construirTextoFormal();

    // 2. Montar Texto do Programa
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
    
    // 3. Montar Texto da Computação (Trace)
    let textoComputacao = '';
    if (maquinaConfig.trace && maquinaConfig.trace.length > 0) {
        const regLetters = Array.from({length: maquinaConfig.qtd}, (_, i) => String.fromCharCode(65 + i));
        const finalValues = regLetters.map(r => maquinaConfig.trace[maquinaConfig.trace.length - 1].memory[regLetters.indexOf(r)]).join(' ');
        const regsSaida = maquinaConfig.saida.join(' ');
        
        textoComputacao += `\n\nCOMPUTAÇÃO:\n`;
        
        // Títulos de colunas de entrada
        textoComputacao += `Valores de entrada: ${maquinaConfig.entrada.join(' ')}\n`;
        if (maquinaConfig.trace[0].memory.length > 0) {
            // Assume que a entrada é mapeada para os primeiros registradores
            const initialInput = maquinaConfig.trace[0].memory.slice(0, maquinaConfig.entrada.length).join(' ');
            textoComputacao += `\t\t\t\t ${initialInput}\n`;
        }

        // Trace
        maquinaConfig.trace.forEach((step, index) => {
            const memString = step.memory.join(',');
            const traceOutput = `(${step.label}, (${memString}))`;
            const comment = index === 0 ? step.comment : step.comment;
            textoComputacao += `${traceOutput}\t // ${comment}\n`;
        });
        
        // Saída
        const finalSaidaValues = maquinaConfig.saida.map(r => finalValues.split(' ')[regLetters.indexOf(r)]).join(' ');
        
        textoComputacao += `\nfunção computada\n`;
        textoComputacao += `valores de saída \t ${regLetters.join(' ')}\n`;
        textoComputacao += `\t\t\t\t ${finalValues}\n`;
        if (maquinaConfig.saida.length > 0) {
            textoComputacao += `(Registradores de Saída: ${regsSaida})\n`;
            textoComputacao += `\t\t\t\t ${finalSaidaValues}\n`;
        }

    } else {
        textoComputacao = "\n\nCOMPUTAÇÃO:\nSimulação não executada.";
    }
    
    document.getElementById('resultado-final').innerText = textoMaquina + textoPrograma + textoComputacao;
    
    step4.classList.remove('active');
    stepResult.classList.add('active');
}

/* --- HELPER FUNCTIONS PARA O TEXTO FORMAL (TUPLA DE DEFINIÇÃO) --- */
function construirTextoFormal() {
    const qtd = maquinaConfig.qtd;
    const regsEntrada = maquinaConfig.entrada.length;
    const regsSaida = maquinaConfig.saida.length;
    
    // 1. Listas de funções para a tupla principal
    const listaOps = [];
    const listaTestes = [];
    
    for(let i=0; i<qtd; i++) {
        let l = String.fromCharCode(65+i);
        listaOps.push(maquinaConfig.operacoes[l].funcName);
        listaTestes.push(maquinaConfig.testes[l].funcName);
    }

    // 2. Montagem do Texto Principal
    let txt = `MAQUINA DE REGISTRADORES (Formal):\n`;
    txt += `M = (N^${qtd}, N^${regsEntrada || 0}, N^${regsSaida || 0}, entrada_func, saida_func, (${listaOps.join(', ')}), (${listaTestes.join(', ')}))\n\n`;
    
    txt += `ONDE:\n`;
    txt += `\tN^${qtd} é o conjunto de valores de memória (registradores R[A]..R[${String.fromCharCode(64+qtd)}])\n`;
    txt += `\tN^${regsEntrada} é o conjunto de valores de entrada (Registradores ${maquinaConfig.entrada.join(',')})\n`;
    txt += `\tN^${regsSaida} é o conjunto de valores de saída (Registradores ${maquinaConfig.saida.join(',')})\n\n`;

    txt += `DEFINIÇÕES DE ENTRADA E SAÍDA:\n`;
    // Descrição genérica da entrada
    if (regsEntrada > 0) {
        const varsEntrada = maquinaConfig.entrada.map(r => r.toLowerCase()).join(',');
        const tuplaMemoria = Array.from({length: qtd}, (_, i) => {
            let l = String.fromCharCode(65+i);
            return maquinaConfig.entrada.includes(l) ? l.toLowerCase() : '0';
        }).join(',');
        
        txt += `\tentrada_func: N^${regsEntrada} -> N^${qtd}\n`;
        txt += `\tentrada_func(${varsEntrada}) = (${tuplaMemoria})\n\n`;
    } else {
        txt += `\tentrada_func: N/A (Sem registradores de entrada definidos)\n\n`;
    }

    // Descrição genérica da saída
    if (regsSaida > 0) {
        const varsMemoria = Array.from({length: qtd}, (_, i) => `n${i+1}`).join(',');
        const varsSaida = maquinaConfig.saida.map(r => {
            let index = r.charCodeAt(0) - 65;
            return `n${index+1}`;
        }).join(',');

        txt += `\tsaida_func: N^${qtd} -> N^${regsSaida}\n`;
        txt += `\tsaida_func(${varsMemoria}) = (${varsSaida})\n\n`;
    } else {
        txt += `\tsaida_func: N/A (Sem registradores de saída definidos)\n\n`;
    }

    txt += `INTERPRETAÇÕES (ESCOLHAS DO USUÁRIO):\n`;
    for(let i=0; i<qtd; i++) {
        let l = String.fromCharCode(65+i);
        
        // Operação
        txt += `\t${maquinaConfig.operacoes[l].funcName} (Op. em R[${l}]): \t${maquinaConfig.operacoes[l].text}\n`;
        
        // Teste
        txt += `\t${maquinaConfig.testes[l].funcName} (Teste em R[${l}]): \t${maquinaConfig.testes[l].text}\n`;
    }

    return txt;
}

// Garante que o estado inicial está correto ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    toggleLabelInputs(); // Garante que a interface do Passo 3 está no estado inicial de Teste
    step1.classList.add('active'); // Garante que o Passo 1 é exibido
});