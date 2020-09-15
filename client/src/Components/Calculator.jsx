import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const Calculator = (props) => {

    let [equation, setEquation] = useState("");
    let [calcsList, setCalcsList] = useState([]);
    const [socket] = useState(() => io(':8000'));
    const [lastResult, setLastResult] = useState("");


    useEffect(() => {
        socket.on('updateCalcsList', data => setCalcsList([data,...calcsList]));
        return () => socket.disconnect
    },[socket,calcsList])

    socket.on("newcalc", equation => {
        setCalcsList([equation,...calcsList])
    })

    const setSocket = e => {
        socket.emit("equation",{equation})
        setCalcsList([{equation},...calcsList])
    }

    const calculator = {
        displayValue: '0',
        firstOperand: null,
        waitingForSecondOperand: false,
        operator: null,
    };

    const addToEquation = (e) => {
        setEquation = (equation += e)
    }

    const addEquationsToCalcsList = (e) => {
        setEquation = "";
        setSocket(e);
    }

    const handleDigit = (digit) => {
        const {displayValue, waitingForSecondOperand} = calculator;
        addToEquation(digit);
        if (waitingForSecondOperand === true) {
            calculator.displayValue = digit;
            calculator.waitingForSecondOperand = false;
            updateDisplay();
        } else {
            calculator.displayValue = displayValue === "0" || lastResult === "" ? digit: displayValue + digit;
            updateDisplay();
        }
    }

    const handleAllClear = () => {
        calculator.displayValue = '0';
        calculator.firstOperand = null;
        calculator.waitingForSecondOperand = null;
        calculator.operator = null;
        setEquation("")
        setLastResult("");
        updateDisplay();
    }

    const handleDecimal = (decimal) => {
        addToEquation(decimal);
        if (!calculator.displayValue.includes(decimal)) {
            calculator.displayValue += decimal;
            updateDisplay();
        }
    }

    const handleOperator = (nextOperator) => {
        addToEquation(nextOperator);
        const { firstOperand, displayValue, operator } = calculator;
        // set existing string displayValue to float 
        const inputValue = parseFloat(displayValue)
        
        if (operator && calculator.waitingForSecondOperand) {
            calculator.operator = nextOperator;
            return;
        }

        if (firstOperand == null) {
            calculator.firstOperand = inputValue;
        }
        
        //if variables and operands have already been added, calc partial result or full result
        else if(operator) {
            const currentValue = firstOperand || 0;
            const result = performCalculation[operator](currentValue, inputValue);

            if (nextOperator === "=") {
                //push result to equation string only on "="
                addToEquation(result); 
                addEquationsToCalcsList(equation)
                setLastResult(result);   
                updateDisplay(result);   
            }
            calculator.displayValue = String(result);
            calculator.firstOperand = result;
            updateDisplay();
        }
        calculator.waitingForSecondOperand = true;
        calculator.operator = nextOperator;
    }

    const performCalculation = {
        '/': (firstOperand,secondOperand) => firstOperand / secondOperand,
        '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
        '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
        '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
        '=': (firstOperand, secondOperand) => secondOperand    
    };


    const updateDisplay = () => {
        const display = document.querySelector('.calculator-screen');
        display.value = calculator.displayValue;
    }


    return (

        <div className="container">
        <div className="row">
          <div className="col">
            <div className="calculator card">
                {/* if last result isn't null, show lastResult, else displayValue */}
                <input type="text" className="calculator-screen z-depth-1" value={lastResult !== "" ? lastResult : calculator.displayValue} disabled />

                <div className="calculator-keys">

                    <button type="button" className="operator btn btn-primary" value="+" onClick = {e => handleOperator(e.target.value)}>+</button>
                    <button type="button" className="operator btn btn-primary" value="-" onClick = {e => handleOperator(e.target.value)}>-</button>
                    <button type="button" className="operator btn btn-primary" value="*" onClick = {e => handleOperator(e.target.value)}>&times;</button>
                    <button type="button" className="operator btn btn-primary" value="/" onClick = {e => handleOperator(e.target.value)}>&divide;</button>

                    <button type="button" value="7" className="btn btn-light waves-effect" onClick = {e => handleDigit(e.target.value)}>7</button>
                    <button type="button" value="8" className="btn btn-light waves-effect" onClick = {e => handleDigit(e.target.value)}>8</button>
                    <button type="button" value="9" className="btn btn-light waves-effect" onClick = {e => handleDigit(e.target.value)}>9</button>


                    <button type="button" value="4" className="btn btn-light waves-effect" onClick = {e => handleDigit(e.target.value)}>4</button>
                    <button type="button" value="5" className="btn btn-light waves-effect" onClick = {e => handleDigit(e.target.value)}>5</button>
                    <button type="button" value="6" className="btn btn-light waves-effect" onClick = {e => handleDigit(e.target.value)}>6</button>


                    <button type="button" value="1" className="btn btn-light waves-effect" onClick = {e => handleDigit(e.target.value)}>1</button>
                    <button type="button" value="2" className="btn btn-light waves-effect" onClick = {e => handleDigit(e.target.value)}>2</button>
                    <button type="button" value="3" className="btn btn-light waves-effect" onClick = {e => handleDigit(e.target.value)}>3</button>


                    <button type="button" value="0" className="btn btn-light waves-effect" onClick = {e => handleDigit(e.target.value)}>0</button>
                    <button type="button" className="decimal function btn btn-secondary" value="." onClick = {e => handleDecimal(e.target.value)}>.</button>
                    <button type="button" className="all-clear function btn btn-danger btn-sm" value="all-clear" onClick = {handleAllClear}>AC</button>

                    <button type="button" className="equal-sign operator btn btn-success" value="=" onClick = {e => handleOperator(e.target.value)}>=</button>

                </div>
            
                </div>
            </div>
            <div className="col">
                <div className="calculations_list" >
                <h1>List of calculations:</h1>
                <ul className="list-group" >
                    {
                        //show 10 calcs, newest to oldest
                        calcsList.map((equation, i) =>
                            i <=9 ?
                            <li key = {i} className="list-group-item">{equation.equation}</li> : null
                        )
                    }
                </ul>
            </div>
            </div>  
        </div>
      </div>
              
    )
   
}

export default Calculator;