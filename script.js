

const eventBus =  (events = [""]) => {
  const eventMap = new Map()
  events.forEach(event => {
    eventMap.set(event, [])
  })

  const dispatch = (event, data = null) => {
    const handlers = eventMap.get(event)

    if(!handlers) return console.error(`Event ${event} not found`)

    handlers.forEach(handler => handler(data))
  }

  const  registerListeners = (event = "", handler = () => {}) => {

    const handlers = eventMap.get(event) || []

    handlers.push(handler);

    eventMap.set(event, handlers)
  }

  return {
    dispatch,
    registerListeners
  }

}


class Calculator {
  context = null

  visor = document.querySelector("#visor");
  buttons = document.querySelectorAll(".botao");
  eventBus = eventBus(["clickDot", "clickNumber", "clickOperator", "clickEqual", "clickClear", "clickOnOff"])
  currentOperator = null;
  eventHistory= []
  operatorVisor = document.querySelector("#current_operator_indicator")
  calculatorHistoryVisor = document.querySelector("#history")
  memory_indicator = document.querySelector("#memory_value")

  numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  numberLimit = 10

  operatorsMap = {
    "+": this.some.bind(this),
    "-": this.subtract.bind(this),
    "*": this.multiply.bind(this),
    "/": this.divide.bind(this),
    "%":  this.percentage.bind(this),
  };

  calculatorFunctionsMap = {
      C: this.resetOperations.bind(this),

      "ON/OFF": this.toggleOnOff.bind(this),
      "CLM":this.clearContext.bind(this),
      "RM":this.printMemory.bind(this),
      "M+": this.addVisorToMemory.bind(this),
      "M-": this.subVisorToMemory.bind(this),
      "+/-": this.toggleSignal.bind(this),
      "√":this.squareRoot.bind(this),
    "1/x": this.inverseOperation.bind(this)

  }

  constructor() {
    this.setupListeners();
  }

  inverseOperation() {
    const visorValue = this.getVisorValue();

    if(visorValue === 0) {
      alert("Não é possível dividir por zero")
      return;
    }


    this.clearVisor();
    this.printVisor(1 / visorValue)
  }

  squareRoot() {
  const visorValue = this.getVisorValue();

    if(visorValue < 0) {
      alert("Valor inválido")
      return;
    }
      this.clearVisor();
      this.printVisor(Math.sqrt(visorValue))
  }



  toggleSignal() {
    const visorValue = this.getVisorValue();
    this.clearVisor();
    this.printVisor(visorValue * -1);
  }

  subVisorToMemory() {
    const visorValue = this.getVisorValue()

    if(isNaN(visorValue)) {
      alert("Valor inválido")
      return
    }
    this.context -= visorValue;
  }

  addVisorToMemory() {

    const visorValue = this.getVisorValue()

    if(isNaN(visorValue)) {
      alert("Valor inválido")
      return
    }
    this.context += visorValue;
  }

  toggleOnOff() {
    this.updateContext(null)
    this.currentOperator = null
    this.clearVisor()
  }

  printMemory() {
    this.clearVisor();
    this.printVisor(this.context ? this.context.toFixed(1) : "");
  }

  clearContext()  {
    this.updateContext(null)
  }

  handleOperator(operator) {
    if(!this.context) {
      this.updateContext(this.getVisorValue());
    }

    this.currentOperator = operator;
    this.clearVisor();
  }

  handleCalculatorFunction(operator) {
    const calculatorFunctionHandler = this.calculatorFunctionsMap[operator];
    calculatorFunctionHandler();
  }

  resetOperations() {
    if(!this.currentOperator) return
    this.clearVisor();
    this.printVisor(this.context);
  }

  addDot() {
    const currentVisorValue = this.visor.innerHTML;
    if(currentVisorValue.includes('.')) {
      return;
    }

    this.printVisor(".");
  }

  clearVisor() {
    this.visor.innerHTML = "";
  }

  printVisor(value) {
    this.visor.innerHTML += value;
  }

  getVisorValue() {
    return Number(this.visor.innerHTML);
  }

  updateContext(value) {
    this.context = value;
    this.memory_indicator.innerHTML = value ? `Valor na memoria: ${value.toFixed(1)}` : "Sem valor"
  }

  handleClickCalculatorButton(value) {
    const isDot = value === ".";
    const isNumeric = this.numbers.includes(Number(value))
    const isOperator = Object.keys(this.operatorsMap).includes(value);
    const isFunctionCalculator = Object.keys(this.calculatorFunctionsMap).includes(value);
    const isEqual = value === "=";

    if(isNumeric) {
    const currentVisorValue = this.visor.innerHTML;

    if(currentVisorValue.length >= this.numberLimit) return;

      this.eventBus.dispatch("clickNumber", value)
    }
    if(isDot) {
      this.eventBus.dispatch("clickDot", value)
    }
    if(isOperator) {
      this.eventBus.dispatch("clickOperator", value)
    }
    if(isFunctionCalculator) {
      this.eventBus.dispatch("clickCalculatorFunction", value)
    }
    if(isEqual) {
      this.eventBus.dispatch("clickEqual", value)
    }
  }

  toggleIndicateOperator(value) {

    const operator = value ?? this.currentOperator;

    const currentButton = Array.from(this.buttons).find(button => button.innerHTML === operator)

    const hasOperatorActive = Array.from(this.buttons).filter(button => button.classList.contains("active"))

    if(hasOperatorActive.length) {
        hasOperatorActive.forEach(button => button.classList.remove("active"))
    }

    if(!currentButton) return;
    currentButton.classList.toggle("active")
  }

  showCurrentOperatorInVisor(operator) {
    this.operatorVisor.innerHTML = operator;
  }

  showHistory(historyItem) {
    this.eventHistory.push(historyItem)

    this.eventHistory.forEach((history) => {
        this.calculatorHistoryVisor.innerHTML += `<p>${history.context.toFixed(1)} 
        ${history.currentOperator} ${history.visorValue} =
        ${history.results.toFixed(1)} </p> <br>`
    })
  }

  clearOperatorVisor() {
    this.operatorVisor.innerHTML = "";
  }

  setupListeners() {
    this.buttons.forEach((button) => {
      button.addEventListener("click", () => this.handleClickCalculatorButton(button.innerHTML));
    });
    this.eventBus.registerListeners("clickDot", this.addDot.bind(this));
    this.eventBus.registerListeners("clickNumber", this.printVisor.bind(this));
    this.eventBus.registerListeners("clickOperator", this.handleOperator.bind(this));
    this.eventBus.registerListeners("clickEqual", this.equal.bind(this));
    this.eventBus.registerListeners("clickCalculatorFunction", this.handleCalculatorFunction.bind(this))
    this.eventBus.registerListeners("clickOperator",this.toggleIndicateOperator.bind(this))
    this.eventBus.registerListeners("clickOperator", this.showCurrentOperatorInVisor.bind(this))
    this.eventBus.registerListeners("operator_made", this.showHistory.bind(this))
    this.eventBus.registerListeners("clickEqual", this.toggleIndicateOperator.bind(this))
    this.eventBus.registerListeners("operator_made", this.showCurrentOperatorInVisor.bind(this))
    this.eventBus.registerListeners("operator_made", this.clearOperatorVisor.bind(this))
  }

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
    if(vl2 === 0) return alert("Não é possível dividir por zero");

    return vl1 / vl2;
  }

  percentage(value1, porcentagem) {
    return (value1 * porcentagem) / 100;
  }

  equal() {
    if(!this.context || !this.currentOperator) return;

    const visorValue = this.getVisorValue();

    const operatorHandler = this.operatorsMap[this.currentOperator];

    const results = operatorHandler(this.context, visorValue);



    this.eventBus.dispatch("operator_made", {
      context: this.context,
      currentOperator: this.currentOperator,
      visorValue: visorValue,
      results,
    })


    this.clearVisor();
    this.updateContext(results);
    this.printVisor(results.toFixed(1))

    this.currentOperator = null;

  }
}

new Calculator();
