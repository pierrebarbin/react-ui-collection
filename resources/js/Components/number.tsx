import React from "react";

import { Input, InputProps } from "./ui/input";
import { Button, ButtonProps } from "./ui/button";

type NumberContextType = {
    display: string,
    setDisplay: any
}

const NumberContext = React.createContext<NumberContextType>({display: "", setDisplay: null});

const useNumber = () => {
    const numberContext = React.useContext(NumberContext)

    if (!numberContext) {
      throw new Error(
        "useNumber has to be used within <NumberContext.Provider>"
      )
    }

    return numberContext
  }



interface NumberRootProps {
 children: React.ReactElement|React.ReactElement[]
 onValueChange?: (value: number) => void
}

const NumberRoot = ({children, onValueChange}: NumberRootProps) => {
    const [display, setDisplay] = React.useState("1")

    React.useEffect(() => {
        if (onValueChange) {
            onValueChange(parseFloat(display))
        }
    }, [onValueChange])

    return (
        <NumberContext.Provider value={{display, setDisplay}}>
            {children}
        </NumberContext.Provider>
    )
}
NumberRoot.displayName = "NumberRoot"

const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({value, onChange, ...props }, ref) => {

        const localValue = value ?? useNumber().display
        const setDisplay = onChange ?? useNumber().setDisplay

        const changeDisplay = (e: React.ChangeEvent<HTMLInputElement>) => {
            setDisplay(e.target.value)
        }

        const onChanged = onChange ?? changeDisplay

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

const NumberIncrease = React.forwardRef<HTMLButtonElement, ButtonProps>(
        ({ children, onClick, ...props }, ref) => {

            const display = children ?? useNumber().display
            const setDisplay = onClick ?? useNumber().setDisplay

            const changeDisplay = (e: React.MouseEvent<HTMLButtonElement>) => {
                setDisplay((display) => (parseFloat(display) + 1).toString())
            }

            const onClicked = onClick ?? changeDisplay

            return (
                <Button
                    ref={ref}
                    {...props}
                    onClick={onClicked}
                >
                    {display}
                </Button>
            )
        }
  )
NumberIncrease.displayName = "NumberIncrease"

export {NumberRoot, NumberInput, NumberIncrease, useNumber}