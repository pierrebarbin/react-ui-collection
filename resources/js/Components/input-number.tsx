import { MinusIcon, PlusIcon } from "@radix-ui/react-icons"
import { NumberRoot, NumberAction, NumberRootProps, NumberActionProps, useNumber } from "./primitive/number"
import React from "react"
import { cn } from "@/lib/utils"
import { Input, InputProps } from "./ui/input"
import { Button } from "./ui/button"

export interface InputNumberProps extends NumberRootProps {
    className?: string
}

const InputNumber = ({ children, className, ...props }: InputNumberProps) => {
    return (
        <NumberRoot {...props}>
            <div className={cn("flex", className)}>
                {children}
            </div>
        </NumberRoot>
    )
}
InputNumber.displayName = "InputNumber"

const InputNumberIncrease = React.forwardRef<HTMLButtonElement, NumberActionProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <NumberAction
                ref={ref}
                size="icon"
                variant="outline"
                {...props}
            >
                <Button className={cn("py-2 px-3 h-auto w-auto rounded-l-none", className)}>
                    {children ? children : <PlusIcon className="w-3 h-3" />}
                </Button>
            </NumberAction>
        )
    }
)
InputNumberIncrease.displayName = "InputNumberIncrease"

const InputNumberDecrease = React.forwardRef<HTMLButtonElement, NumberActionProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <NumberAction
                ref={ref}
                size="icon"
                variant="outline"
                order="decrease"
                {...props}
            >
                <Button className={cn("py-2 px-3 h-auto w-auto rounded-r-none", className)}>
                    {children ? children : <MinusIcon className="w-3 h-3" />}
                </Button>
            </NumberAction>
        )
    }
)
InputNumberDecrease.displayName = "InputNumberDecrease"

const InputNumberInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        const {display, updateValue} = useNumber()

        const change = (e: React.ChangeEvent<HTMLInputElement>) => {
            updateValue(e.target.value)
        }

        return (
            <Input
                ref={ref}
                className={cn("w-20 text-center rounded-none z-10", className)}
                value={display}
                onChange={change}
                {...props}
            />
        )
    }
)
InputNumberInput.displayName = "InputNumberInput"

export {InputNumber, InputNumberInput, InputNumberIncrease, InputNumberDecrease}