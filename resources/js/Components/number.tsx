import React from "react";

import { Input, InputProps } from "./ui/input";
import { Button, ButtonProps } from "./ui/button";

type NumberContextType = {
    value: number,
    setValue: React.Dispatch<React.SetStateAction<number>>|null
}

const NumberContext = React.createContext<NumberContextType>({value: 1, setValue: null});

const useNumber = () => {
    const numberContext = React.useContext(NumberContext)

    if (!numberContext) {
      throw new Error(
        "useNumber has to be used within <NumberContext.Provider>"
      )
    }

    return numberContext
}

function convertToNumber(value: string) {
    return parseFloat(value)
}

function convertToString(value: number) {
    return value.toString()
}


interface NumberRootProps {
 children: React.ReactElement|React.ReactElement[]
 onValueChange?: (value: number) => void
}

const NumberRoot = ({children, onValueChange}: NumberRootProps) => {
    const [value, setValue] = React.useState(1)

    React.useEffect(() => {
        if (onValueChange) {
            onValueChange(value)
        }
    }, [onValueChange, value])

    return (
        <NumberContext.Provider value={{value, setValue}}>
            {children}
        </NumberContext.Provider>
    )
}
NumberRoot.displayName = "NumberRoot"

const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({value, onChange, ...props }, ref) => {

        const localValue = value ?? useNumber().value
        const setValue = useNumber().setValue

        const onChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
            setValue && setValue(convertToNumber(e.target.value))
            onChange && onChange(e)
        }

        return (
            <Input
                ref={ref}
                {...props}
                value={localValue}
                onChange={onChanged}
            />
        )
    }
)
NumberInput.displayName = "Input"

interface NumberButtonProps extends ButtonProps {
    order?: "increase"|"decrease"
    offset?: number
}

const NumberButton = React.forwardRef<HTMLButtonElement, NumberButtonProps>(
        ({ children, onClick, order = "increase", offset = 1, ...props }, ref) => {

            const value = children ?? convertToString(useNumber().value)
            const setValue = useNumber().setValue

            const onClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
                setValue && setValue((value) => {
                    if (order === "increase") {
                        return value + offset
                    }

                    if (order === "decrease") {
                        return value - offset
                    }

                    return value
                })
                onClick && onClick(e)
            }

            return (
                <Button
                    ref={ref}
                    {...props}
                    onClick={onClicked}
                >
                    {value}
                </Button>
            )
        }
  )
NumberButton.displayName = "NumberIncrease"

export {NumberRoot, NumberInput, NumberButton, useNumber}