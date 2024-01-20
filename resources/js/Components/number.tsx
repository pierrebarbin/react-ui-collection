import React from "react";

import { ButtonProps } from "./ui/button";
import { Slot } from "@radix-ui/react-slot";

type NumberContextType = {
    value: number|null,
    display: string
    setValue: React.Dispatch<React.SetStateAction<number|null>>|null
    setDisplay: React.Dispatch<React.SetStateAction<string>>|null
    digits: number
    only: "positive"|"negative"|"both"
    min: number|null
    max: number|null
}

const NumberContext = React.createContext<NumberContextType>({
    value: 0,
    display: "0",
    setValue: null,
    setDisplay: null,
    digits: 2,
    only: "both",
    min: null,
    max: null
});

const useNumber = () => {
    const numberContext = React.useContext(NumberContext)

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

        if (value === ".") {
            setDisplay && setDisplay("0.")
            setValue && setValue(0)
            return
        }

        if (value === "-") {
            setDisplay && setDisplay("-")
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

        const valueDisplay = convertToString(value)
        const valueNumber = convertToNumber(value)

        if (min && valueNumber < min) {
            return min
        }

        if (max && valueNumber > max) {
            return max
        }

        setDisplay && setDisplay(valueDisplay)
        setValue && setValue(valueNumber)
    }

    if (!numberContext) {
      throw new Error(
        "useNumber has to be used within <NumberContext.Provider>"
      )
    }

    return {...numberContext, convertToNumber, convertToString, updateValue}
}

export interface NumberRootProps {
    children: React.ReactElement|React.ReactElement[]
    onValueChange?: (value: number|null) => void
    digits?: number
    only?: "positive"|"negative"|"both"
    min?: number|null
    max?: number|null
}

const NumberRoot = ({children, onValueChange, digits = 2, only = "both", min = null, max = null}: NumberRootProps) => {
    const [value, setValue] = React.useState<number|null>(0)
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
            setDisplay,
            only,
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

            const {value, setValue, setDisplay, convertToNumber, convertToString, only} = useNumber()

            const calculate = (value: number) => {
                if (order === "increase") {
                    value = value + offset
                }

                if (order === "decrease") {
                    value = value - offset
                }

                if (only === "positive" && value < 0) {
                    return 0
                }

                if (only === "negative" && value > 0) {
                    return 0
                }

                return value
            }

            const onClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
                const calculated = calculate(value ?? 0)

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

export {NumberRoot, NumberAction, useNumber}