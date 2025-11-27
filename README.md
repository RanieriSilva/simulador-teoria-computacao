


# 📘 Simulador de Máquina de Registradores

### *Register Machine Simulator – HTML, CSS e JavaScript*

Este projeto implementa um **Simulador de Máquina de Registradores (Register Machine)**, desenvolvido como uma ferramenta educacional para auxiliar no estudo da **Teoria da Computação** e dos **modelos formais de computabilidade**.

A aplicação é totalmente **client-side** e construída em **HTML + CSS + JavaScript puro**, funcionando diretamente no navegador sem dependências externas.

---

## ✨ Funcionalidades

O simulador possui uma interface intuitiva dividida em **4 passos**, cobrindo todo o processo de definição e execução de uma Máquina de Registradores monolítica:

| Passo                              | Descrição                                                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Passo 1 – Estrutura da Máquina** | Definição da quantidade de registradores e quais são de entrada e saída.                                             |
| **Passo 2 – Interpretações**       | Associação de operações (ex.: `inc_A`, `sub_B`) e testes lógicos (ex.: `A_zero`, `B_maior_zero`) a cada registrador. |
| **Passo 3 – Programa Monolítico**  | Construção das instruções rotuladas de Teste (T) e Operação (O), determinando o fluxo do programa.                   |
| **Passo 4 – Simulação & Trace**    | Execução passo a passo, visualizando memória, instruções e a evolução do programa em tempo real.                     |

### 📝 Resultado final

Ao concluir a simulação, o sistema gera:

* O **trace completo da execução**
* A **representação formal da Máquina de Registradores**, em notação textual padrão
* A representação formal do **Programa Monolítico**

---

## 🚀 Como Utilizar

1. **Clone o repositório**

   ```bash
   git clone https://github.com/RanieriSilva/simulador-teoria-computacao
   ```

2. **Abra o arquivo principal**
   Basta abrir o arquivo **`index.html`** em qualquer navegador moderno (Chrome, Firefox, Edge, etc.).

3. **Use a interface seguindo os 4 passos**
   Defina a máquina → configure operações → escreva o programa → execute e veja o trace.

---

## 📁 Estrutura do Projeto

A estrutura foi organizada em arquivos modulares, facilitando manutenção e compreensão:

### **1. `index.html`**

Contém a interface principal do simulador:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Simulador de Máquina - Teoria da Computação</title>
    <link rel="stylesheet" href="styles.css"> 
</head>
<body>
    <div class="container">
        <!-- Conteúdo dos passos -->
    </div>
    <script src="script.js"></script>
</body>
</html>
```

---

### **2. `styles.css`**

Define todo o estilo visual do simulador:

```css
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f0f2f5;
    display: flex;
    justify-content: center;
}

.step-container {
    display: none;
    animation: fadeIn 0.5s;
}

.btn-action {
    background-color: #27ae60;
}
```

---

### **3. `script.js`**

Contém toda a lógica de funcionamento: manipulação do DOM, estrutura da máquina e simulação.

```javascript
/* VARIÁVEIS GLOBAIS */
let maquinaConfig = { qtd: 0, entrada: [], saida: [], operacoes: {}, testes: {} };
let programa = [];
const MAX_STEPS = 1000;

function executarSimulacao() {
    // Iniciar memória, aplicar entradas, executar programa e gerar trace
}

function construirTextoFormal() {
    // Geração da tupla M = (...)
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('step-1').classList.add('active');
});
```

---

## 💡 Conceito da Máquina de Registradores

A Máquina de Registradores é um modelo formal equivalente às Máquinas de Turing (Monolitico).

O simulador implementa exatamente esse comportamento, exibindo a evolução dos registradores e do **Program Counter (PC)** ao longo da execução.

---

## 📜 Licença

Este projeto pode ser usado livremente para fins educacionais e acadêmicos.
