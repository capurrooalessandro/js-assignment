// a) CORE MATH FUNCTIONS

const add = (a, b) => {
    const result = a + b;
    console.log(`${a} + ${b} = ${result}`);
    return result;
};
const subtract = (a, b) => {
    const result = a - b;
    console.log(`${a} - ${b} = ${result}`);
    return result;
};
const multiply = (a, b) => {
    const result = a * b;
    console.log(`${a} * ${b} = ${result}`);
    return result;
};
const divide = (a, b) => {
    if (b === 0) {
        
        console.log(`Attempted to divide by zero: ${a} / ${b}`);
        return "Division by zero not possible";
    }
    const result = a / b;
    console.log(`${a} / ${b} = ${result}`);
    return result;
};


// b) OPERATE FUNCTION

const operate = (operator, a, b) => {
    a = Number(a);
    b = Number(b);
    switch (operator) {
        case '+':
            return add(a, b);
        case '-':
            return subtract(a, b);
        case '*':
            return multiply(a, b);
        case '/':
            return divide(a, b);
       
    }
};


// c) HTML Calculator


// d) Populate display

const display = document.querySelector('#display');

const updateDisplay = () => {
    // Update the display element with the current displayValue.
    // If the value is too long, we can shrink the font size.
    if (calculator.displayValue.length > 9) {
         display.style.fontSize = '2.5rem'; //need to confirm
    } else {
         display.style.fontSize = '3rem'; // need to confirm
    }
    display.textContent = calculator.displayValue;
};
// Initialize display on load
updateDisplay();


// e) Make the calculator work!

const calculator = {
    displayValue: '0',
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null
};

// Resets calculator
const resetCalculator = () => {
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
    updateDisplay(); // Update display immediately after reset
};


const inputDigit = (digit) => {
    const { displayValue, waitingForSecondOperand } = calculator;

    if (waitingForSecondOperand === true) {
        // If we were waiting for the second number, this digit is the start of it.
        calculator.displayValue = digit;
        calculator.waitingForSecondOperand = false;
    } else {
        // Otherwise, append the digit. Handle the case where the display is '0'.
        calculator.displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
};

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
        
        /*
        if (result === "Nope.") {
            calculator.displayValue = "Nope.";
            // We'll reset after a short delay to show the message
            setTimeout(() => resetCalculator(), 1000);
            return;
        }
        */
        // Round long decimals to 7 places.
        const roundedResult = parseFloat(result.toFixed(7)); // need to confirm decimal places
        calculator.displayValue = `${roundedResult}`;
        calculator.firstOperand = roundedResult;
    }

    calculator.waitingForSecondOperand = true;
    calculator.operator = nextOperator;
};


// g) Preventing more than one input decimal from being inputted

const inputDecimal = (dot) => {
    if (calculator.waitingForSecondOperand) {
       // If we press '.' after an operator, start with "0."
       calculator.displayValue = '0.';
       calculator.waitingForSecondOperand = false;
       return;
   }
   // Prevent adding multiple decimal points.
   if (!calculator.displayValue.includes(dot)) {
       calculator.displayValue += dot;
   }
};


// h) backspace button


// i) keyboard support

