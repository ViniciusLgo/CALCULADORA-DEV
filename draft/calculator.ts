const eventType = {
  add: "add",
  subtract: "subtract",
  multiply: "multiply",
  divide: "divide",
  showResult: "showResult",
  all: "all",
} as const;

type EventType = (typeof eventType)[keyof typeof eventType];

interface CalculatorEvent<Value = unknown> {
  eventType: EventType;
  payload?: Value;
}

type EventHandler = <Value = unknown>(event: CalculatorEvent<Value>) => void;

class Calculator {
  private listeners: Map<EventType, EventHandler[]> = new Map();
  private storageHistory: CalculatorEvent[] = [];
  private context: number | null;

  constructor() {
    this.applyListener([eventType.all], this.saveHistory);
    console.log("Calculator created");
    this.setupListeners();
  }

  saveHistory(event: CalculatorEvent) {
    this.storageHistory.push(event);
  }

  dispatchEvent(event: CalculatorEvent) {
    const { eventType, payload } = event;

    const eventHandlers = this.listeners.get(eventType);

    if (!eventHandlers) {
      throw new Error(`Event type ${eventType} is not supported`);
    }

    eventHandlers.forEach((handler) => handler(event));
  }

  applyListener(eventTypes: EventType[], handler: EventHandler) {
    const canListenAllEvents = eventTypes.includes(eventType.all);

    const eventsToListen = canListenAllEvents ? Array.from(this.listeners.keys()) : eventTypes;

    eventsToListen.forEach((eventType) => {
      const currentEventHandlers = this.listeners.get(eventType);

      if (!currentEventHandlers) {
        throw new Error(`Event type ${eventType} is not supported`);
      }

      this.listeners.set(eventType, [...currentEventHandlers, handler]);
    });
  }

  saveInContext(value) {
    this.context.push(event);
  }

  private setupListeners() {
    Object.keys(eventType).forEach((key) => {
      this.listeners.set(eventType[key], []);
    });

    this.applyListener([eventType.all], (event) => {
      this.saveHistory(event);
    });
  }

  some(a: number, b: number) {
    const result = a + b;

    this.dispatchEvent({ eventType: eventType.add, payload: { a, b, result } });

    return result;
  }

  subtract(a: number, b: number) {
    const result = a - b;

    this.dispatchEvent({ eventType: eventType.subtract, payload: { a, b, result } });

    return result;
  }

  multiply(a: number, b: number) {
    const result = a * b;

    this.dispatchEvent({ eventType: eventType.multiply, payload: { a, b, result } });

    return result;
  }

  divide(a: number, b: number) {
    const result = a / b;

    this.dispatchEvent({ eventType: eventType.divide, payload: { a, b, result } });

    return result;
  }
}
