import React, { useState } from "react";

import { Input, InputProps } from "./ui/input";
import { Button, ButtonProps } from "./ui/button";
import { Slot } from "@radix-ui/react-slot";

type NumberContextType = {
    value: number,
    display: string
    setValue: React.Dispatch<React.SetStateAction<number>>|null
    setDisplay: React.Dispatch<React.SetStateAction<string>>|null
    digits: number
}

const NumberContext = React.createContext<NumberContextType>({
    value: 1,
    display: "1",
    setValue: null,
    setDisplay: null,
    digits: 2
});

const useNumber = () => {
    const numberContext = React.useContext(NumberContext)

    function convertToNumber(value: number|string) {
        if (typeof value === 'string') {
            value = parseFloat(value)
        }

        const digits = Math.pow(10, numberContext.digits)

        return Math.round(value * digits) / digits
    }

    function convertToString(value: number|string) {

        if (typeof value === 'string' && value.slice(-1) === ".") {
            return value
        }

        value = convertToNumber(value)

        return value.toString()
    }

    if (!numberContext) {
      throw new Error(
        "useNumber has to be used within <NumberContext.Provider>"
      )
    }

    return {...numberContext, convertToNumber, convertToString}
}

export interface NumberRootProps {
 children: React.ReactElement|React.ReactElement[]
 onValueChange?: (value: number) => void
 digits?: number
}

const NumberRoot = ({children, onValueChange, digits = 2}: NumberRootProps) => {
    const [value, setValue] = React.useState(0)
    const [display, setDisplay] = React.useState("0")

    React.useEffect(() => {
        if (onValueChange) {
            onValueChange(value)
        }
    }, [onValueChange, value])

    return (
        <NumberContext.Provider value={{
            value,
            setValue,
            digits: digits < 0 ? 0 : digits,
            display,
            setDisplay
        }}>
            {children}
        </NumberContext.Provider>
    )
}
NumberRoot.displayName = "NumberRoot"

const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({value, onChange, ...props }, ref) => {
        const {digits, display, setValue, convertToNumber, convertToString, setDisplay} = useNumber()

        const onChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value

            let digitsRegex = ""
            let afterDecimalRegex = ""

            if (digits === 1) {
                digitsRegex = "{1}"
            }

            if (digits > 1) {
                digitsRegex = `{1,${digits.toString()}}`
            }

            if (digits >= 1) {
                afterDecimalRegex = `(\.?([0-9]${digitsRegex})?)?`
            }

            const regex = new RegExp(`[0-9]*${afterDecimalRegex}`)

            const result = regex.exec(value)

            if (result === null) {
                return
            }

            const isInvalid = result[0] !== result?.input

            setDisplay && setDisplay((oldValue) => {
                if (value === "" || value === ".") {
                    return "0"
                }

                if (isInvalid) {
                    return oldValue
                }

                return convertToString(value)
            })
            setValue && setValue((oldValue) => {
                if (value === "" || value === ".") {
                    return 0
                }

                if (isInvalid) {
                    return oldValue
                }

                return convertToNumber(value)
            })
            onChange && onChange(e)
        }

        return (
            <Input
                ref={ref}
                {...props}
                value={value ?? display}
                onChange={onChanged}
            />
        )
    }
)
NumberInput.displayName = "Input"

export interface NumberActionProps extends ButtonProps {
    order?: "increase"|"decrease"
    offset?: number
}

const NumberAction = React.forwardRef<HTMLButtonElement, NumberActionProps>(
        ({ onClick, order = "increase", offset = 1, ...props }, ref) => {

            const {value, setValue, setDisplay, convertToNumber, convertToString} = useNumber()

            const calculate = (value: number) => {
                if (order === "increase") {
                    return value + offset
                }

                if (order === "decrease") {
                    return value - offset
                }

                return value
            }

            const onClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
                const calculated = calculate(value)

                setValue && setValue(convertToNumber(calculated))
                setDisplay && setDisplay(convertToString(calculated))
                onClick && onClick(e)
            }

            return (
                <Slot
                    ref={ref}
                    {...props}
                    onClick={onClicked}
                />
            )
        }
  )
NumberAction.displayName = "NumberIncrease"

export {NumberRoot, NumberInput, NumberAction, useNumber}