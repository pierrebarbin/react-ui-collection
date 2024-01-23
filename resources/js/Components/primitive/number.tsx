import React from "react";

import { ButtonProps } from "../ui/button";
import { Slot } from "@radix-ui/react-slot";

type NumberContextType = {
    value: number|null,
    display: string
    setValue: React.Dispatch<React.SetStateAction<number|null>>|null
    setDisplay: React.Dispatch<React.SetStateAction<string>>|null
    digits: number
    min: number|null
    max: number|null
}

const NumberContext = React.createContext<NumberContextType>({
    value: 0,
    display: "0",
    setValue: null,
    setDisplay: null,
    digits: 2,
    min: null,
    max: null
});

const useNumber = () => {
    const numberContext = React.useContext(NumberContext)

    if (!numberContext) {
        throw new Error(
          "useNumber has to be used within <NumberContext.Provider>"
        )
    }

    const {digits, setDisplay, setValue, min, max} = numberContext

    const convertToNumber = (value: number|string) => {
        if (typeof value === 'string') {
            value = parseFloat(value)
        }

        const digits = Math.pow(10, numberContext.digits)

        return Math.round(value * digits) / digits
    }

    const convertToString = (value: number|string) => {

        if (typeof value === 'string' && value.slice(-1) === ".") {
            return value
        }

        value = convertToNumber(value)

        return value.toString()
    }

    const updateValue = (value: string  ) => {
        if (value === "") {
            setDisplay && setDisplay("")
            setValue && setValue(null)
            return
        }


        let digitsRegex = ""
        let afterDecimalRegex = ""

        if (digits === 1) {
            digitsRegex = "{1}"
        }

        if (digits > 1) {
            digitsRegex = `{1,${digits.toString()}}`
        }

        if (digits >= 1) {
            afterDecimalRegex = `([.]?([0-9]${digitsRegex})?)?`
        }

        const regex = new RegExp(`-?[0-9]*${afterDecimalRegex}`)

        const result = regex.exec(value)

        if (result === null) {
            return
        }

        const isInvalid = result[0] !== result?.input

        if (isInvalid) {
            setDisplay && setDisplay((old) => old)
            setValue && setValue((old) => old)
            return
        }

        if (value === ".") {
            setDisplay && setDisplay("0.")
            value = "0"
            return
        }

        if (value === "-") {
            if (min !== null && 0 <= min) {
                setDisplay && setDisplay(convertToString(min))
                setValue && setValue(convertToNumber(min))
                return
            }
            setDisplay && setDisplay("-")
            setValue && setValue(null)
            return
        }

        if (value === "-0" || value === "-0.") {
            setDisplay && setDisplay(value)
            setValue && setValue(0)
            return
        }

        const valueNumber = convertToNumber(value)

        if (min !== null && valueNumber <= min) {
            setDisplay && setDisplay(convertToString(min))
            setValue && setValue(convertToNumber(min))
            return
        }

        if (max !== null && valueNumber >= max) {
            setDisplay && setDisplay(convertToString(max))
            setValue && setValue(convertToNumber(max))
            return max
        }

        setDisplay && setDisplay(convertToString(value))
        setValue && setValue(valueNumber)
    }

    return {...numberContext, convertToNumber, convertToString, updateValue}
}

export interface NumberRootProps {
    children: React.ReactElement|React.ReactElement[]
    onValueChange?: (value: number|null) => void
    digits?: number
    min?: number|null
    max?: number|null
    defaultValue?: number|null
}

const NumberRoot = ({children, onValueChange, digits = 2, min = null, max = null, defaultValue = null}: NumberRootProps) => {
    const [value, setValue] = React.useState<number|null>(defaultValue)
    const [display, setDisplay] = React.useState(defaultValue?.toString() ?? "")

    React.useEffect(() => {
        if (onValueChange) {
            onValueChange(value)
        }
    }, [value])

    return (
        <NumberContext.Provider value={{
            value,
            setValue,
            digits: digits < 0 ? 0 : digits,
            display,
            setDisplay,
            min,
            max
        }}>
            {children}
        </NumberContext.Provider>
    )
}
NumberRoot.displayName = "NumberRoot"

export interface NumberActionProps extends ButtonProps {
    order?: "increase"|"decrease"
    offset?: number
}

const NumberAction = React.forwardRef<HTMLButtonElement, NumberActionProps>(
        ({ onClick, order = "increase", offset = 1, ...props }, ref) => {

            const {value, updateValue, convertToString} = useNumber()

            const calculate = (value: number) => {
                if (order === "increase") {
                    value = value + offset
                }

                if (order === "decrease") {
                    value = value - offset
                }

                return value
            }

            const onClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
                const calculated = calculate(value ?? 0)

                updateValue(convertToString(calculated))
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

export {NumberRoot, NumberAction, useNumber}