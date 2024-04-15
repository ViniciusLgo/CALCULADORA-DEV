const eventBus = (events = [""]) => {
  // Cria um mapa para armazenar os eventos e seus respectivos handlers
  const eventMap = new Map();
  // Para cada evento fornecido, inicializa uma lista de handlers vazia
  events.forEach((event) => {
    eventMap.set(event, []);
  });

  // Função para despachar um evento e chamar seus handlers associados
  const dispatch = (event, data = null) => {
    // Obtém os handlers associados ao evento
    const handlers = eventMap.get(event);

    // Se não houver handlers registrados para o evento, exibe um erro
    if (!handlers) return console.error(`Event ${event} not found`);

    // Chama cada handler associado ao evento, passando os dados se fornecidos
    handlers.forEach((handler) => handler(data));
  };

  // Função para registrar um novo handler para um evento específico
  const registerListeners = (event = "", handler = () => {}) => {
    // Obtém a lista atual de handlers para o evento ou inicializa uma lista vazia
    const handlers = eventMap.get(event) || [];

    // Adiciona o novo handler à lista de handlers
    handlers.push(handler);

    // Atualiza o mapa de eventos com a nova lista de handlers para o evento específico
    eventMap.set(event, handlers);
  };

  // Retorna as funções de despacho e registro de handlers para uso externo
  return {
    dispatch,
    registerListeners,
  };
};
class Calculator {
  // Contexto de operações, como valores e resultados intermediários
  context = null;

  // Elemento do visor da calculadora
  visor = document.querySelector("#visor");

  // Botões da calculadora
  buttons = document.querySelectorAll(".botao");

  // Event Bus para lidar com eventos da calculadora
  eventBus = eventBus([
    "clickDot", // Ponto decimal
    "clickNumber", // Números
    "clickOperator", // Operadores matemáticos
    "clickEqual", // Botão de igual
    "clickClear", // Limpar visor
    "clickOnOff", // Ligando/Desligando a calculadora
  ]);

  // Operador atual em uso na calculadora
  currentOperator = null;

  // Histórico de eventos e operações realizadas
  eventHistory = [];

  // Visor do operador atualmente em uso
  operatorVisor = document.querySelector("#current_operator_indicator");

  // Histórico de operações realizadas na calculadora
  calculatorHistoryVisor = document.querySelector("#history");

  // Indicador de memória da calculadora
  memory_indicator = document.querySelector("#memory_value");

  // Conjunto de números disponíveis na calculadora
  numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Limite máximo de dígitos no visor da calculadora
  numberLimit = 9;

  // Mapeamento de operadores matemáticos para suas funções correspondentes
  operatorsMap = {
    "+": this.some.bind(this), // Adição
    "-": this.subtract.bind(this), // Subtração
    "*": this.multiply.bind(this), // Multiplicação
    "/": this.divide.bind(this), // Divisão
    "%": this.percentage.bind(this), // Porcentagem
  };

  // Mapeamento de funções especiais da calculadora para suas operações correspondentes
  calculatorFunctionsMap = {
    C: this.resetOperations.bind(this), // Limpar operações
    "ON/OFF": this.toggleOnOff.bind(this), // Ligando/Desligando a calculadora
    CLM: this.clearContext.bind(this), // Limpar contexto atual
    RM: this.printMemory.bind(this), // Mostrar valor em memória
    "M+": this.addVisorToMemory.bind(this), // Adicionar valor ao contexto de memória
    "M-": this.subVisorToMemory.bind(this), // Subtrair valor do contexto de memória
    "+/-": this.toggleSignal.bind(this), // Alternar sinal do valor no visor
    "√": this.squareRoot.bind(this), // Raiz quadrada
    "1/x": this.inverseOperation.bind(this), // Inverso de um valor
  };

  // Construtor da classe Calculator
  constructor() {
    // Configuração inicial da calculadora
    this.setupListeners();
  }

  // Método para operação de inversão de um valor
  inverseOperation() {
    // Obter o valor atual do visor
    const visorValue = this.getVisorValue();

    // Verificar se o valor é zero para evitar divisão por zero
    if (visorValue === 0) {
      alert("Não é possível dividir por zero");
      return;
    }

    // Limpar o visor e mostrar o resultado da inversão
    this.clearVisor();
    this.printVisor(1 / visorValue);
  }

  // Método para operação de cálculo da raiz quadrada
  squareRoot() {
    // Obter o valor atual do visor
    const visorValue = this.getVisorValue();

    // Verificar se o valor é negativo para evitar raiz quadrada de número negativo
    if (visorValue < 0) {
      alert("Valor inválido");
      return;
    }

    // Limpar o visor e mostrar o resultado da raiz quadrada
    this.clearVisor();
    this.printVisor(Math.sqrt(visorValue));
  }

  // Método para alternar o sinal do valor no visor
  toggleSignal() {
    // Obter o valor atual do visor
    const visorValue = this.getVisorValue();

    // Limpar o visor e mostrar o valor com sinal invertido
    this.clearVisor();
    this.printVisor(visorValue * -1);
  }

  // Método para subtrair o valor do visor do contexto de memória
  subVisorToMemory() {
    // Obter o valor atual do visor
    const visorValue = this.getVisorValue();

    // Verificar se o valor é válido antes de subtrair da memória
    if (isNaN(visorValue)) {
      alert("Valor inválido");
      return;
    }

    // Subtrair o valor do contexto de memória
    this.context -= visorValue;
  }

  // Método para adicionar o valor do visor ao contexto de memória
  addVisorToMemory() {
    // Obter o valor atual do visor
    const visorValue = this.getVisorValue();

    // Verificar se o valor é válido antes de adicionar à memória
    if (isNaN(visorValue)) {
      alert("Valor inválido");
      return;
    }

    // Adicionar o valor ao contexto de memória
    this.context += visorValue;
  }

  // Método para alternar o estado da calculadora entre ligada/desligada
  toggleOnOff() {
    // Limpar o contexto e operador atuais, e limpar o visor
    this.updateContext(null);
    this.updateOperator(null);
    this.clearVisor();
  }

  // Método para exibir o valor em memória no visor da calculadora
  printMemory() {
    // Limpar o visor e mostrar o valor em memória, limitado pelo número máximo de dígitos
    this.clearVisor();
    this.printVisor(
      this.context >= this.numberLimit
        ? this.context.slice(0, this.numberLimit)
        : this.context
    );
  }

  // Método para limpar o contexto atual da calculadora
  clearContext() {
    this.updateContext(null);
  }

  // Método para lidar com a seleção de um operador
  handleOperator(operator) {
    // Verificar se há um contexto atual, se não houver, atualizar com o valor do visor
    if (!this.context) {
      this.updateContext(this.getVisorValue());
    }

    // Atualizar o operador atual e limpar o visor
    this.updateOperator(operator);
    this.clearVisor();
  }

  // Método para lidar com a seleção de uma função especial da calculadora
  handleCalculatorFunction(operator) {
    // Obter o handler correspondente à função da calculadora
    const calculatorFunctionHandler = this.calculatorFunctionsMap[operator];
    // Chamar o handler correspondente à função
    calculatorFunctionHandler();
  }

  // Método para redefinir as operações e limpar o visor
  resetOperations() {
    this.updateOperator(null);
    this.clearVisor();
  }

  // Método para adicionar um ponto decimal ao visor, evitando múltiplos pontos
  addDot() {
    const currentVisorValue = String(this.getVisorValue());

    // Verificar se o ponto decimal já está presente no valor atual
    if (currentVisorValue.includes(".")) {
      return;
    }

    // Adicionar o ponto decimal ao visor
    this.printVisor(".");
  }

  // Método para limpar o conteúdo do visor da calculadora
  clearVisor() {
    this.visor.innerHTML = "";
  }

  // Método para exibir um valor no visor da calculadora, respeitando o limite de dígitos
  printVisor(value) {
    const visorIsClear = this.visor.innerHTML === "";
    const exceedMaxNumberLength = String(value).length >= this.numberLimit;

    // Se o visor estiver vazio e o valor exceder o limite de dígitos, mostrar apenas os dígitos permitidos
    if (visorIsClear && exceedMaxNumberLength) {
      this.visor.innerHTML = value.toString().slice(0, this.numberLimit);
      return;
    }

    // Se o valor não exceder o limite de dígitos, adicionar ao visor
    if (!exceedMaxNumberLength) {
      this.visor.innerHTML += value;
    }
  }

  // Método para obter o valor atual do visor como um número
  getVisorValue() {
    return Number(this.visor.innerHTML);
  }

  // Método para atualizar o operador atualmente em uso na calculadora
  updateOperator(operator) {
    this.currentOperator = operator;
    this.operatorVisor.innerHTML = operator ?? "";
  }

  // Método para atualizar o contexto de operações da calculadora
  updateContext(value) {
    this.context = value;
    // Atualizar o indicador de memória se houver um valor no contexto
    this.memory_indicator.innerHTML = value
      ? `Memoria: ${this.truncValue(value)}`
      : "";
  }

  // Método para lidar com o clique em um botão da calculadora
  handleClickCalculatorButton(value) {
    const isDot = value === ".";
    const isNumeric = this.numbers.includes(Number(value));
    const isOperator = Object.keys(this.operatorsMap).includes(value);
    const isFunctionCalculator = Object.keys(
      this.calculatorFunctionsMap
    ).includes(value);
    const isEqual = value === "=";

    // Verificar o tipo de botão clicado e despachar o evento correspondente
    if (isNumeric) {
      const currentVisorValue = this.visor.innerHTML;

      if (currentVisorValue.length >= this.numberLimit) return;

      this.eventBus.dispatch("clickNumber", value);
    }
    if (isDot) {
      this.eventBus.dispatch("clickDot", value);
    }
    if (isOperator) {
      this.eventBus.dispatch("clickOperator", value);
    }
    if (isFunctionCalculator) {
      this.eventBus.dispatch("clickCalculatorFunction", value);
    }
    if (isEqual) {
      this.eventBus.dispatch("clickEqual", value);
    }
  }

  // Método para alternar a indicação visual do operador atual
  toggleIndicateOperator(value) {
    const operator = value ?? this.currentOperator;

    const currentButton = Array.from(this.buttons).find(
      (button) => button.innerHTML === operator
    );

    const hasOperatorActive = Array.from(this.buttons).filter((button) =>
      button.classList.contains("active")
    );

    if (hasOperatorActive.length) {
      hasOperatorActive.forEach((button) => button.classList.remove("active"));
    }

    if (!currentButton) return;
    currentButton.classList.toggle("active");
  }

  // Método para exibir o operador atual no visor da calculadora
  showCurrentOperatorInVisor(operator) {
    this.operatorVisor.innerHTML = operator;
  }

  // Método para truncar um valor para o limite de dígitos permitidos
  truncValue(value) {
    return String(value).slice(0, this.numberLimit);
  }

  // Método para exibir o histórico de operações realizadas na calculadora
  showHistory(historyItem) {
    this.eventHistory.push(historyItem);

    this.eventHistory.forEach((history) => {
      this.calculatorHistoryVisor.innerHTML += `<p>${this.truncValue(
        history.context
      )} 
          ${history.currentOperator} ${this.truncValue(history.visorValue)} =
          ${this.truncValue(history.results)} </p> <br>`;
    });
  }

  // Método para limpar o visor do operador atual
  clearOperatorVisor() {
    this.operatorVisor.innerHTML = "";
  }

  // Método para configurar os listeners de eventos na inicialização da calculadora
  setupListeners() {
    // Adicionar um listener de clique para cada botão da calculadora
    this.buttons.forEach((button) => {
      button.addEventListener("click", () =>
        this.handleClickCalculatorButton(button.innerHTML)
      );
    });

    // Registrar listeners para eventos específicos no event bus da calculadora
    this.eventBus.registerListeners("clickDot", this.addDot.bind(this));
    this.eventBus.registerListeners("clickNumber", this.printVisor.bind(this));
    this.eventBus.registerListeners(
      "clickOperator",
      this.handleOperator.bind(this)
    );
    this.eventBus.registerListeners("clickEqual", this.equal.bind(this));
    this.eventBus.registerListeners(
      "clickCalculatorFunction",
      this.handleCalculatorFunction.bind(this)
    );
    this.eventBus.registerListeners(
      "clickOperator",
      this.toggleIndicateOperator.bind(this)
    );
    this.eventBus.registerListeners(
      "clickOperator",
      this.showCurrentOperatorInVisor.bind(this)
    );
    this.eventBus.registerListeners(
      "operator_made",
      this.showHistory.bind(this)
    );
    this.eventBus.registerListeners(
      "clickEqual",
      this.toggleIndicateOperator.bind(this)
    );
    this.eventBus.registerListeners(
      "operator_made",
      this.showCurrentOperatorInVisor.bind(this)
    );
    this.eventBus.registerListeners(
      "operator_made",
      this.clearOperatorVisor.bind(this)
    );
  }

  // Métodos de operações matemáticas básicas

  some(vl1, vl2) {
    return vl1 + vl2;
  }

  subtract(vl1, vl2) {
    return vl1 - vl2;
  }

  multiply(vl1, vl2) {
    return vl1 * vl2;
  }

  divide(vl1, vl2) {
    if (vl2 === 0) return alert("Não é possível dividir por zero");

    return vl1 / vl2;
  }

  percentage(value1, porcentagem) {
    return (value1 * porcentagem) / 100;
  }

  // Método para realizar o cálculo final quando o botão de igual é pressionado
  equal() {
    if (!this.context || !this.currentOperator) return;

    const visorValue = this.getVisorValue();

    const operatorHandler = this.operatorsMap[this.currentOperator];

    const results = operatorHandler(this.context, visorValue);

    this.eventBus.dispatch("operator_made", {
      context: this.context,
      currentOperator: this.currentOperator,
      visorValue: visorValue,
      results,
    });

    this.clearVisor();
    this.updateContext(results);
    this.printVisor(results);
    this.updateOperator(null);
  }
}

new Calculator();
