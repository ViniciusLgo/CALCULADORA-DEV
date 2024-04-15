

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
  numberLimit = 9

  operatorsMap = {
    "+": this.some.bind(this),
    "-": this.subtract.bind(this),
    "*": this.multiply.bind(this),
    "/": this.divide.bind(this),
    "%": this.percentage.bind(this),
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
    this.updateOperator(null)
    this.clearVisor()
  }

  printMemory() {
    this.clearVisor();
    this.printVisor(this.context >= this.numberLimit ? this.context.slice(0, this.numberLimit) : this.context)
  }

  clearContext()  {
    this.updateContext(null)
  }

  handleOperator(operator) {
    if(!this.context) {
      this.updateContext(this.getVisorValue());
    }

    this.updateOperator(operator);
    this.clearVisor();
  }

  handleCalculatorFunction(operator) {
    const calculatorFunctionHandler = this.calculatorFunctionsMap[operator];
    calculatorFunctionHandler();
  }

  resetOperations() {
    this.updateOperator(null)
    this.clearVisor();
  }


  addDot() {
    const currentVisorValue = String(this.getVisorValue());

    if(currentVisorValue.includes('.')) {
      return;
    }
    this.printVisor(".");
  }

  clearVisor() {
    this.visor.innerHTML = "";
  }

  printVisor(value) {

    const visorIsClear = this.visor.innerHTML === "";
    const exceedMaxNumberLength = String(value).length >= this.numberLimit;

    console.log({exceedMaxNumberLength})

    if(visorIsClear && exceedMaxNumberLength) {
        this.visor.innerHTML = value.toString().slice(0, this.numberLimit);
        return;
    }

    if(!exceedMaxNumberLength) {
      this.visor.innerHTML += value;
    }
  }

  getVisorValue() {
    return Number(this.visor.innerHTML);
  }

  updateOperator(operator) {
    this.currentOperator = operator;
    this.operatorVisor.innerHTML = operator ?? "";
  }



  updateContext(value) {
    this.context = value;
    this.memory_indicator.innerHTML = value ? `Memoria: ${this.truncValue(value)}` : ""
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

  truncValue(value) {
    return String(value).slice(0, this.numberLimit)
  }

  showHistory(historyItem) {
    this.eventHistory.push(historyItem)

    this.eventHistory.forEach((history) => {
        this.calculatorHistoryVisor.innerHTML += `<p>${this.truncValue(history.context)} 
        ${history.currentOperator} ${this.truncValue(history.visorValue)} =
        ${this.truncValue(history.results)} </p> <br>`
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
    this.printVisor(results)
    this.updateOperator(null)

  }
}

new Calculator();
