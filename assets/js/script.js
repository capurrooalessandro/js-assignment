document.body.style.zoom = 1.25;  

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
        case '÷': return divide(a, b);
        default: return NaN;
    }
};

// --- STATE FIRST (so updateDisplay can read it) ---
const calculator = {
    displayValue: '0',
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null,
    history: ''// added property for storing the calculator string
};

// --- DISPLAY (query the right element; set .value for <input>) ---
const display = document.querySelector('.calc-display');

const historyDisplay = document.querySelector('#history-display'); //selector for history element

const updateDisplay = () => {
    const len = calculator.displayValue.length;
    // simple font shrink threshold – tune as needed
    if (window.innerWidth <= 380) {
        display.style.fontSize = len > 12 ? '1.26rem' : '1.3rem';
    } else if (window.innerWidth <= 1400) {
        display.style.fontSize = len > 14 ? '1.3rem' : '1.5rem';
    } else {
        display.style.fontSize = len > 14 ? '1.5rem' : '1.6rem';
    }
    if (len >= 16) { //Limits the characters of the calculator to 16
        display.value = calculator.displayValue.substring(0, 16)
    } else {
        display.value = calculator.displayValue; 
    }
};

// function to update the history view
const updateHistoryDisplay = () => {
    historyDisplay.textContent = calculator.history;
}

window.addEventListener("resize", () => {
    if (window.innerWidth <= 380) {
        display.style.fontSize = len > 12 ? '1.26rem' : '1.3rem';
    } else if (window.innerWidth <= 1400) {
        display.style.fontSize = len > 14 ? '1.3rem' : '1.5rem';
    } else {
        display.style.fontSize = len > 14 ? '1.5rem' : '1.6rem';
    }
})

// Initialize after everything above exists
updateDisplay();
updateHistoryDisplay();

// --- RESET ---
const resetCalculator = () => {
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
    calculator.history = ''; // clear history
    updateDisplay();
    updateHistoryDisplay(); // updates the cleared history display
};

// --- INPUT DIGITS ---
const inputDigit = (digit) => {
    const { displayValue, waitingForSecondOperand } = calculator;

     // If the previous calculation result is on display, a new digit should clear the history
    if (calculator.firstOperand !== null && calculator.waitingForSecondOperand === false && calculator.operator === null) {
        calculator.history = '';
    }

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

    if (calculator.operator === null && calculator.firstOperand !== null) {
        calculator.firstOperand = inputValue;
    };


    // If an operator is pressed and we already have a first operand, calculate the result first.
    // This handles chained operations like 5 + 5 - 2
    if (operator && calculator.waitingForSecondOperand) {
        const result = operate(operator, firstOperand, inputValue); // inputValue is the same as firstOperand here

        if (isNaN(result)) {
            calculator.displayValue = "Error";
            setTimeout(() => resetCalculator(), 1000);
            return;
        }

        const roundedResult = parseFloat(result.toFixed(7));
        calculator.displayValue = `${roundedResult}`;
        calculator.firstOperand = roundedResult;
        
        // Now, set up for the next operation with the NEW operator
        calculator.operator = nextOperator;
        calculator.history = `${roundedResult} ${nextOperator}`; // Update history to show intermediate result
        updateHistoryDisplay();
        updateDisplay();
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
            
            calculator.history = ''; // Clear history on error
            updateDisplay();
            // Reset after a short delay to show the message
            setTimeout(() => resetCalculator(), 1000);
            return;
        }

        // Round long decimals to 7 places.
        const roundedResult = parseFloat(result.toFixed(7)); // need to confirm decimal places
        calculator.displayValue = `${roundedResult}`;
        calculator.firstOperand = roundedResult;
    }

    // add to history
    if(!calculator.waitingForSecondOperand){
        calculator.history += ` ${displayValue} ${nextOperator}`;
        updateHistoryDisplay();
    }

    calculator.waitingForSecondOperand = true;
    calculator.operator = nextOperator;
    updateDisplay();
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
    updateDisplay();
};

// --- EVENT LISTENERS (for calculator button clicks) ---
const keys = document.querySelector('.calc-keys'); // selects calculator keys class
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
                // This logic is now handled inside handleOperator when a new number is entered
                // We just need to perform the final calculation
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
                
                    calculator.history += ` ${displayValue} =`;
                    //calculator.history = calculator.displayValue;
                    updateHistoryDisplay();
                    updateDisplay();

                        // Reset for next calculation
                    calculator.firstOperand = parseFloat(calculator.displayValue);
                    calculator.waitingForSecondOperand = false;
                    calculator.operator = null;
                }
                break;
        }
    }

});

// --- KEYBOARD SUPPORT ---
window.addEventListener('keydown', (event) => {
    const key = event.key;
    let button;
    //event.preventDefault(); // Prevent default browser actions

    // Find button based on the key pressed
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
        button.click(); // Simulate a click on the corresponding button
    }
});