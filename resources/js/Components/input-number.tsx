import { MinusIcon, PlusIcon } from "@radix-ui/react-icons"
import { NumberRoot, NumberRootProps, useNumber } from "./primitive/number"
import React from "react"
import { cn } from "@/lib/utils"
import { Input, InputProps } from "./ui/input"
import {Button, ButtonProps} from "./ui/button"

export interface InputNumberProps extends NumberRootProps {
    className?: string
    value?: number|null
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

export interface InputNumberActionProps extends ButtonProps {
    order: "increase"|"decrease"
    step?: number
}

const InputNumberAction = React.forwardRef<HTMLButtonElement, InputNumberActionProps>(
    ({ children, onClick, order, step= 1, ...props }, ref) => {
        const {value, updateValue, convertToString} = useNumber()

        const calculate = (value: number) => {
            if (order === "increase") {
                value = value + step
            }

            if (order === "decrease") {
                value = value - step
            }

            return value
        }

        const handleClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
            const calculated = calculate(value ?? 0)

            updateValue(convertToString(calculated))
            onClick && onClick(e)
        }

        return (
            <Button
                ref={ref}
                size="icon"
                variant="outline"
                {...props}
                onClick={handleClicked}
            >
                {children}
            </Button>
        )
    }
)
InputNumberAction.displayName = "InputNumberIncrease"

type InputNumberIncreaseProps = Omit<InputNumberActionProps, 'order'>

const InputNumberIncrease = React.forwardRef<HTMLButtonElement, InputNumberIncreaseProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <InputNumberAction
                ref={ref}
                order="increase"
                className={cn("py-2 px-3 h-auto w-auto", className)}
                {...props}
            >
                {children ? children : <PlusIcon className="w-3 h-3" />}
            </InputNumberAction>
        )
    }
)
InputNumberIncrease.displayName = "InputNumberIncrease"

type InputNumberDecreaseProps = Omit<InputNumberActionProps, 'order'>

const InputNumberDecrease = React.forwardRef<HTMLButtonElement, InputNumberDecreaseProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <InputNumberAction
                ref={ref}
                order="decrease"
                className={cn("py-2 px-3 h-auto w-auto", className)}
                {...props}
            >
                {children ? children : <MinusIcon className="w-3 h-3" />}
            </InputNumberAction>
        )
    }
)
InputNumberDecrease.displayName = "InputNumberDecrease"

interface InputNumberInputProps extends Omit<InputProps, 'value'>{
    value?: number|null
    step?: number
}

const InputNumberInput = React.forwardRef<HTMLInputElement, InputNumberInputProps>(
    ({ className, value, step = 1, ...props }, ref) => {
        const [focused, setFocused] = React.useState(false)
        const [hovered, setHovered] = React.useState(false)

        const {value: localValue, display, updateValue} = useNumber()

        React.useEffect(() => {
            if (value !== undefined && value !== localValue) {
                updateValue(value ? value.toString() : "")
            }
        }, [value, localValue])

        React.useEffect(() => {
            if (!hovered || !focused) {
                return
            }

            const handleScroll = (e: React.WheelEvent) => {
                e.preventDefault()

                if (e.deltaY > 0) {
                    updateValue(((localValue ?? 0) + step).toString())
                    return
                }
                updateValue(((localValue ?? 0) - step).toString())
            }

            let supportsPassive = false;
            try {
                window.addEventListener("scroll", () => {}, Object.defineProperty({}, 'passive', {
                    get: function () { supportsPassive = true; }
                }));
            } catch(e) {}

            const wheelOpt = supportsPassive ? { passive: false } : false;
            const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

            // @ts-ignore
            window.addEventListener('DOMMouseScroll', handleScroll, false); // older FF
            // @ts-ignore
            window.addEventListener(wheelEvent, handleScroll, wheelOpt); // modern desktop
            // @ts-ignore
            window.addEventListener('touchmove', handleScroll, wheelOpt); // mobile

            return () => {
                // @ts-ignore
                window.removeEventListener('DOMMouseScroll', handleScroll, false);
                // @ts-ignore
                window.removeEventListener(wheelEvent, handleScroll, wheelOpt);
                // @ts-ignore
                window.removeEventListener('touchmove', handleScroll, wheelOpt);
                window.removeEventListener("scroll", () => {}, Object.defineProperty({}, 'passive', {
                    get: function () { supportsPassive = true; }
                }));
            }
        }, [focused, hovered, localValue, step])

        const change = (e: React.ChangeEvent<HTMLInputElement>) => {
            updateValue(e.target.value)
        }

        const handleFocus = () => {
            setFocused(true)
        }

        const handleBlur = () => {
            setFocused(false)
        }

        const handleMouseEnter = () => {
            setHovered(true)
        }

        const handleMouseLeave = () => {
            setHovered(false)
        }

        return (
            <Input
                ref={ref}
                className={cn("w-20 text-center rounded-none z-10", className)}
                value={display}
                onChange={change}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                {...props}
            />
        )
    }
)
InputNumberInput.displayName = "InputNumberInput"

export {InputNumber, InputNumberInput, InputNumberAction, InputNumberIncrease, InputNumberDecrease}
