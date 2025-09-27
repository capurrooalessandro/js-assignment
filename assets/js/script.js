const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => (b === 0 ? NaN : a / b);

const operate = (operator, a, b) => {
    a = Number(a);
    b = Number(b);
    switch (operator) {
        case '+': return add(a, b);
        case '-': return subtract(a, b);
        case '*': return multiply(a, b);
        case '÷': return divide(a, b);
        default: return NaN;
    }
};

const calculator = {
    displayValue: '0',
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null,
    history: ''
};

const updateFont = () => {
    if (window.innerWidth <= 380) {
        display.style.fontSize = '1.8rem';
    } else if (window.innerWidth <= 1400) {
        display.style.fontSize = '2.11rem';
    } else {
        display.style.fontSize = '2.5rem';
    }
}

const display = document.querySelector('.calc-display');
const historyDisplay = document.querySelector('.history-display');

const updateDisplay = () => {
    updateFont();
    display.value = calculator.displayValue = calculator.displayValue.substring(0, 14);
};

const updateHistoryDisplay = () => {
    historyDisplay.textContent = calculator.history;
}

window.addEventListener("resize", updateFont);

updateDisplay();
updateHistoryDisplay();

const resetCalculator = () => {
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
    calculator.history = '';
    updateDisplay();
    updateHistoryDisplay();
};

const inputDigit = (digit) => {
    const { displayValue, waitingForSecondOperand } = calculator;

    if (calculator.operator === null && calculator.firstOperand !== null && !waitingForSecondOperand) {
        calculator.history = '';
        updateHistoryDisplay();
    }
    
    if (waitingForSecondOperand === true) {
        calculator.displayValue = digit;
        calculator.waitingForSecondOperand = false;
    } else {
        calculator.displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
    updateDisplay();
};

const handleOperator = (nextOperator) => {
    
    const { firstOperand, displayValue, operator } = calculator;
    const inputValue = parseFloat(displayValue);

   
    if (operator && calculator.waitingForSecondOperand) {
        // Calculate using the first number for both parts (e.g., 9 + 9)
        const result = operate(operator, firstOperand, firstOperand);

        if (isNaN(result)) {
            calculator.displayValue = "Error";
            setTimeout(() => resetCalculator(), 1000);
            updateDisplay();
            return;
        }
        
        const roundedResult = parseFloat(result.toFixed(7));
        calculator.displayValue = `${roundedResult}`;
        calculator.firstOperand = roundedResult;
        
        // Set up for the next operation
        calculator.operator = nextOperator;
        
        calculator.history = `${roundedResult}${nextOperator}`;
        updateHistoryDisplay();
        updateDisplay();
        return;
    }
    if (firstOperand === null && !isNaN(inputValue)) {
        calculator.firstOperand = inputValue;
    } else if (operator) {
        const result = operate(operator, firstOperand, inputValue);

        if (isNaN(result)) {
            calculator.displayValue = "Error";
            
            calculator.history ='';
            updateDisplay();
            setTimeout(() => resetCalculator(), 1000);
            return;
        }

        const roundedResult = parseFloat(result.toFixed(7));
        calculator.displayValue = `${roundedResult}`;
        calculator.firstOperand = roundedResult;
    }

    calculator.waitingForSecondOperand = true;
    calculator.operator = nextOperator;
    calculator.history = `${calculator.firstOperand}${nextOperator}`;
    updateHistoryDisplay();
};

const inputDecimal = (dot) => {
    if (calculator.waitingForSecondOperand) {
        calculator.displayValue = '0.';
        calculator.waitingForSecondOperand = false;
        updateDisplay();
        return;
    }
    if (!calculator.displayValue.includes(dot)) {
        calculator.displayValue += dot;
        updateDisplay();
    }
};

const backspace = () => {
    if (calculator.displayValue.length === 1 || calculator.displayValue === 'Error') {
        calculator.displayValue = '0';
    } else {
        calculator.displayValue = calculator.displayValue.slice(0, -1);
    }
    updateDisplay();
};

const keys = document.querySelector('.calc-keys');
keys.addEventListener('click', (event) => {
    const { target } = event;
    const { action, digit, op } = target.dataset;

    if (!target.matches('button')) {
        return;
    }

    const operatorSymbols = { add: '+', subtract: '-', multiply: '*', divide: '÷' };

    if (digit) {
        inputDigit(digit);
    } else if (op) {
        handleOperator(operatorSymbols[op]);
    } else if (action) {
        switch (action) {
            case 'decimal':
                inputDecimal('.');
                break;
            case 'clear':
                resetCalculator();
                break;
            case 'backspace':
                backspace();
                break;
            case 'equals':
                if (calculator.operator && !calculator.waitingForSecondOperand) {
                    const { firstOperand, displayValue, operator } = calculator;
                    const inputValue = parseFloat(displayValue);
                    const result = operate(operator, firstOperand, inputValue);

                    if (isNaN(result)) {
                        calculator.displayValue = "Error";
                        setTimeout(() => resetCalculator(), 1000);
                    } else {
                        const roundedResult = parseFloat(result.toFixed(7));
                        calculator.displayValue = `${roundedResult}`;
                    }
                
                    calculator.history += `${displayValue}=`;
                    updateHistoryDisplay();
                    updateDisplay();
                    calculator.firstOperand = parseFloat(calculator.displayValue);
                    calculator.waitingForSecondOperand = false;
                    calculator.operator = null;
                }
                break;
        }
    }

});

window.addEventListener('keydown', (event) => {
    const key = event.key;
    let button;
    if (key >= 0 && key <= 9) {
        button = document.querySelector(`button[data-digit="${key}"]`);
    } else if (key === '.') {
        button = document.querySelector(`button[data-action="decimal"]`);
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        const opMap = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide' };
        button = document.querySelector(`button[data-op="${opMap[key]}"]`);
    } else if (key === 'Enter' || key === '=') {
        button = document.querySelector(`button[data-action="equals"]`);
    } else if (key === 'Backspace') {
        button = document.querySelector(`button[data-action="backspace"]`);
    } else if (key === 'Escape') {
        button = document.querySelector(`button[data-action="clear"]`);
    }
    
    if (button) {
        event.preventDefault();
        button.click();
    }
});