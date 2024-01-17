import React from "react";

import { Input, InputProps } from "./ui/input";
import { Button, ButtonProps } from "./ui/button";
import { Slot } from "@radix-ui/react-slot";

type NumberContextType = {
    value: number,
    setValue: React.Dispatch<React.SetStateAction<number>>|null
    digits: number
}

const NumberContext = React.createContext<NumberContextType>({value: 1, setValue: null, digits: 2});

const useNumber = () => {
    const numberContext = React.useContext(NumberContext)

    function convertToNumber(value: number|string) {
        if (typeof value === 'string') {
            value = parseFloat(value)
        }

        return Math.round(value* 100) / 100
    }

    function convertToString(value: number) {
        return value.toFixed(numberContext.digits ?? 2)
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

const NumberRoot = ({children, onValueChange, digits}: NumberRootProps) => {
    const [value, setValue] = React.useState(1)

    React.useEffect(() => {
        if (onValueChange) {
            onValueChange(value)
        }
    }, [onValueChange, value])

    return (
        <NumberContext.Provider value={{value, setValue, digits: digits ?? 2}}>
            {children}
        </NumberContext.Provider>
    )
}
NumberRoot.displayName = "NumberRoot"

const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({value, onChange, ...props }, ref) => {

        const {value: localValue, setValue, convertToNumber} = useNumber()

        const onChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
            setValue && setValue((oldValue) => {
                const value = convertToNumber(e.target.value)

                if (Number.isNaN(value)) {
                    return oldValue
                }

                return value
            })
            onChange && onChange(e)
        }

        return (
            <Input
                ref={ref}
                {...props}
                value={value ?? localValue}
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

            const {setValue, convertToNumber} = useNumber()

            const onClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
                setValue && setValue((value) => {
                    if (order === "increase") {
                        return convertToNumber(value + offset)
                    }

                    if (order === "decrease") {
                        return convertToNumber(value - offset)
                    }

                    return value
                })
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