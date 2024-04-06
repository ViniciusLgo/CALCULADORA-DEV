class Calculator {
  context = null;

  visor = document.querySelector("#visor");

  buttons = document.querySelectorAll(".botao");

  operators = ["+", "-", "*", "/", "C", "CLM", "S/F", "RM", "M+", "/"];

  numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  currentOperator = null;

  operatorsMap = {
    "+": this.some.bind(this),
    "-": this.subtract.bind(this),
    "*": this.multiply.bind(this),
    "/": this.divide.bind(this),
    "=": this.equal.bind(this),
  };

  constructor() {
    this.setupListeners();
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
    const isOperator = this.operators.includes(value);

    console.log(value);

    if (value === "=") {
      if (this.currentOperator && this.context) {
        const results = this.equal(this.getVisorValue());

        this.clearVisor();

        this.printVisor(results);

        this.context = null;
        this.currentOperator = null;
      }

      return;
    }

    if (isOperator) {
      this.context = this.getVisorValue();

      console.log(this.context);

      this.currentOperator = value;

      this.clearVisor();
    } else {
      this.printVisor(value);
    }
  }

  setupListeners() {
    this.buttons.forEach((button) => {
      button.addEventListener("click", () => this.handleClickCalculatorButton(button.innerHTML));
    });
  }

  some(value) {
    return this.context + value;
  }

  subtract(value) {
    return this.context - value;
  }

  multiply(value) {
    return this.context * value;
  }

  divide(value) {
    return this.context / value;
  }

  equal(value) {
    const results = this.operatorsMap[this.currentOperator](value);

    return results;
  }
}

new Calculator();
