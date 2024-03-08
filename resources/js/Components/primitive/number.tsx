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
    onValueChange?: (value: number|null) => void
    ignoreOverflow?: boolean
}

const NumberContext = React.createContext<NumberContextType>({
    value: 0,
    display: "0",
    setValue: null,
    setDisplay: null,
    digits: 2,
    min: null,
    max: null,
    onValueChange: undefined,
    ignoreOverflow: false
});

const useNumber = () => {
    const numberContext = React.useContext(NumberContext)

    if (!numberContext) {
        throw new Error(
          "useNumber has to be used within <NumberContext.Provider>"
        )
    }

    const {
        min,
        max,
        digits,
        ignoreOverflow,
        setDisplay,
        setValue,
        onValueChange
    } = numberContext

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


    const renderValue = ({value, display}: {value: number|null, display: string}) => {
        setDisplay && setDisplay(display)
        setValue && setValue(value)
        onValueChange && onValueChange(value)
    }

    const updateValue = (value: string ) => {
        if (value === "") {
            renderValue({value: null, display: ""})
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
            setValue && setValue((old) => {
                onValueChange && onValueChange(old)
                return old
            })
            return
        }

        if (value === ".") {
            renderValue({value: 0, display: ""})
            return
        }

        if (value === "-") {
            if (min !== null && 0 <= min) {
                renderValue({
                    value: convertToNumber(min),
                    display: convertToString(min)
                })
                return
            }
            renderValue({
                value: null,
                display: "-"
            })
            return
        }

        if (value === "-0" || value === "-0.") {
            renderValue({
                value: 0,
                display: value
            })
            return
        }

        const valueNumber = convertToNumber(value)

        if (min !== null && valueNumber <= min) {
            if (ignoreOverflow) {
                return
            }
            renderValue({
                value: convertToNumber(min),
                display: convertToString(min)
            })
            return
        }

        if (max !== null && valueNumber >= max) {
            if (ignoreOverflow) {
                return
            }
            renderValue({
                value: convertToNumber(max),
                display: convertToString(max)
            })
            return
        }

        renderValue({
            value: valueNumber,
            display: convertToString(value)
        })
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
    ignoreOverflow?: boolean
}

const NumberRoot = ({children, onValueChange, digits = 2, min = null, max = null, defaultValue = null, ignoreOverflow = false}: NumberRootProps) => {
    const [value, setValue] = React.useState<number|null>(defaultValue)
    const [display, setDisplay] = React.useState(defaultValue?.toString() ?? "")

    return (
        <NumberContext.Provider value={{
            min,
            max,
            value,
            display,
            ignoreOverflow,
            digits: digits < 0 ? 0 : digits,
            setValue,
            setDisplay,
            onValueChange
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
NumberAction.displayName = "NumberAction"

export {NumberRoot, NumberAction, useNumber}
