

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

  numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  currentOperator = null;

  operatorsMap = {
    "+": this.some.bind(this),
    "-": this.subtract.bind(this),
    "*": this.multiply.bind(this),
    "/": this.divide.bind(this),
  };

  calculatorFunctionsMap = {
    C: this.resetOperations.bind(this),
     "ON/OFF": this.toggleOnOff.bind(this),
     "CLM":() => {},
     "S/F":() => {},
     "RM":() => {},
     "M+":() => {},
  }

  constructor() {
    this.setupListeners();
  }


  toggleOnOff() {
    this.context = null;
    this.currentOperator = null
    this.clearVisor()
  }

  handleOperator(operator) {
    if(!this.context) {
        this.context = this.getVisorValue();
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

  handleClickCalculatorButton(value) {
    const isDot = value === ".";
    const isNumeric = this.numbers.includes(Number(value))
    const isOperator = Object.keys(this.operatorsMap).includes(value);
    const  isFunctionCalculator = Object.keys(this.calculatorFunctionsMap).includes(value);
    const isEqual = value === "=";

   if(isNumeric) {
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

  setupListeners() {
    this.buttons.forEach((button) => {
      button.addEventListener("click", () => this.handleClickCalculatorButton(button.innerHTML));
    });
    this.eventBus.registerListeners("clickDot", this.addDot.bind(this));
    this.eventBus.registerListeners("clickNumber", this.printVisor.bind(this));
    this.eventBus.registerListeners("clickOperator", this.handleOperator.bind(this));
    this.eventBus.registerListeners("clickEqual", this.equal.bind(this));
    this.eventBus.registerListeners("clickCalculatorFunction", this.handleCalculatorFunction.bind(this))
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

  equal() {
    if(!this.context || !this.currentOperator) return;

    const visorValue = this.getVisorValue();

    const operatorHandler = this.operatorsMap[this.currentOperator];

   const results = operatorHandler(this.context, visorValue);

    this.clearVisor();

    this.context = results;

    this.printVisor(results.toFixed(2))

    this.currentOperator = null;

  }
}

new Calculator();
