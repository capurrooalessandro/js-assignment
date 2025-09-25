// CORE MATH FUNCTIONS
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => (b === 0 ? NaN : a / b); // return NaN, let UI handle message

// OPERATE FUNCTION (expects symbols; map if your UI uses names)
const operate = (operator, a, b) => {
    a = Number(a);
    b = Number(b);
    switch (operator) {
        case '+': return add(a, b);
        case '-': return subtract(a, b);
        case '*': return multiply(a, b);
        case '/': return divide(a, b);
        default: return NaN;
    }
};

// --- STATE FIRST (so updateDisplay can read it) ---
const calculator = {
    displayValue: '0',
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null
};

// --- DISPLAY (query the right element; set .value for <input>) ---
const display = document.querySelector('.calc-display');

const updateDisplay = () => {
    const len = calculator.displayValue.length;
    // simple font shrink threshold – tune as needed
    display.style.fontSize = len > 9 ? '0.8rem' : '1.4rem';
    display.value = calculator.displayValue; // input.value, not textContent
};

// Initialize after everything above exists
updateDisplay();

// --- RESET ---
const resetCalculator = () => {
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
    updateDisplay();
};

// --- INPUT DIGITS ---
const inputDigit = (digit) => {
    const { displayValue, waitingForSecondOperand } = calculator;
    calculator.displayValue = waitingForSecondOperand
        ? digit
        : (displayValue === '0' ? digit : displayValue + digit);
    calculator.waitingForSecondOperand = false;
    updateDisplay();
};

// --- HANDLING OPERATORS ----
const handleOperator = (nextOperator) => {
    const { firstOperand, displayValue, operator } = calculator;
    const inputValue = parseFloat(displayValue);

    // If an operator is pressed and we already have a first operand, calculate the result first.
    // This handles chained operations like 5 + 5 - 2
    if (operator && calculator.waitingForSecondOperand) {
        // If user changes their mind on the operator
        calculator.operator = nextOperator;
        return;
    }
    
    if (firstOperand === null && !isNaN(inputValue)) {
        // If it's the first number, store it as the first operand.
        calculator.firstOperand = inputValue;
    } else if (operator) {
        // If there's already an operator, we should calculate.
        const result = operate(operator, firstOperand, inputValue);

        // Handle division by zero
        if (isNaN(result)) {
            calculator.displayValue = "Error";
            // We'll reset after a short delay to show the message
            setTimeout(() => resetCalculator(), 1000);
            return;
        }

        // Round long decimals to 7 places.
        const roundedResult = parseFloat(result.toFixed(7)); // need to confirm decimal places
        calculator.displayValue = `${roundedResult}`;
        calculator.firstOperand = roundedResult;
    }

    calculator.waitingForSecondOperand = true;
    calculator.operator = nextOperator;
};


// --- SINGLE DECIMAL ENTRY CHECK ---
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

// --- FUNCTION FOR BACKSPACE USAGE ---
const backspace = () => {
    if (calculator.displayValue.length === 1 || calculator.displayValue === 'Error') {
        calculator.displayValue = '0';
    } else {
        calculator.displayValue = calculator.displayValue.slice(0, -1);
    }
};

// --- KEYBOARD SUPPORT ---


// --- EVENT LISTENERS (for calculator button clicks) ---
const keys = document.querySelector('.calc-keys'); // selects calculator keys class
keys.addEventListener('click', (event) => {
    const { target } = event; // Destructure target from event object
    const { action, digit, op } = target.dataset;

    if (!target.matches('button')) {
        return; // Exit if the click was not on a button
    }

    // Check for data-digit, data-op, or data-action attributes
    if (digit) {
        inputDigit(digit); // This function now calls updateDisplay
        return;
    }

    if (op) {
        const operatorSymbols = { add: '+', subtract: '-', multiply: '*', divide: '/' };
        handleOperator(operatorSymbols[op]);
        updateDisplay(); // handleOperator does not update display directly
        return;
    }

    if (action) {
        switch (action) {
            case 'decimal':
                inputDecimal('.'); 
                break;
            case 'clear':
                resetCalculator(); 
                break;
            case 'backspace':
                backspace();
                updateDisplay(); 
                break;
            case 'equals':
                 // When equals is pressed, perform the final calculation.
                if (calculator.operator && !calculator.waitingForSecondOperand) {
                    handleOperator(calculator.operator); // Temporarily run handleOperator to do the math
                    calculator.waitingForSecondOperand = false; // Reset these after calculation
                    calculator.operator = null;
                    updateDisplay(); // Update the display with the final result
                }
                break;
        }
        return;
    }

});
