import { InputNumber, InputNumberInput } from "./input-number"
import React from "react"
import { cn } from "@/lib/utils"

interface Input {
    id: string
    ref: React.RefObject<HTMLInputElement>
    value: number|null
}

interface focusPreviousOptions {
    removeValue: boolean
}

interface PinCodeContextType {
    inputs: Input[],
    setInputs: React.Dispatch<React.SetStateAction<Array<Input>>>|null
    handleChange: (value: number|null, id: string) => void
    focusInput: (id: string) => void
    focusNext: () => void
    focusPrevious: (options?: focusPreviousOptions) => void
}

const PinCodeContext = React.createContext<PinCodeContextType>({
    inputs: [],
    setInputs: null,
    handleChange: () => {},
    focusInput: () => {},
    focusNext: () => {},
    focusPrevious: () => {}
})

const usePinCode = () => {
    const inputPinCodeContext = React.useContext(PinCodeContext)

    if (!inputPinCodeContext) {
        throw new Error(
          "useInputPinCode has to be used within <PinCodeContext.Provider>"
        )
    }

    return inputPinCodeContext
}

interface PinCodeInputProps extends React.HTMLAttributes<HTMLInputElement> {}

const PinCodeInput = ({className, ...props}: PinCodeInputProps) => {
    const [direction, setDirection] = React.useState("next")
    const [value, setValue] = React.useState<number|null>(null)

    const ref = React.useRef(null)

    const id = React.useId()
    const {
        inputs,
        setInputs,
        handleChange,
        focusInput,
        focusNext,
        focusPrevious
    } = usePinCode()

    React.useEffect(() => {
        setInputs && setInputs((inputs) => [...inputs, {id, ref, value: null}])
        return () => {
            setInputs && setInputs((inputs) => inputs.filter((input) => input.id !== id))
        }
    }, [])

    React.useEffect(() => {
        if (direction === "previous") {
            focusPrevious({removeValue: true})
        }
    }, [direction])

    React.useEffect(() => {
        if (value && direction === "next") {
            focusNext()
        }
    }, [value, direction])

    React.useEffect(() => {
        const input = inputs.find((input) => input.id === id)

        if (input && input.value !== value) {
            setInputs && setValue(input.value)
        }
    }, [inputs, value])

    const handleFocus = () => {
        focusInput(id)
        setDirection("next")
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowLeft") {
            focusPrevious()
            return
        }

        if (e.key === "ArrowRight") {
            focusNext()
            return
        }

        if (e.key === "Backspace" && value === null ) {
            e.preventDefault()
            setDirection("previous")
            return
        }
        setDirection("next")
    }

    return (
        <InputNumber
            onValueChange={(newValue) => {
                handleChange(newValue, id)
                setValue(newValue)
            }}
            value={value}
            digits={0}
            min={0}
            max={9}
            ignoreOverflow
        >
            <InputNumberInput
                ref={ref}
                value={value}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                className={cn(className, "focus:z-20")}
                {...props}
            />
        </InputNumber>
    )
}

interface PinCodeProps extends React.HTMLAttributes<HTMLDivElement> {
    digits?: number
    onCompletion?: (pin: string) => void
}

const PinCode = ({ children, className, digits = 4, onCompletion, ...props }: PinCodeProps) => {
    const [focusedInput, setFocusedInput] = React.useState<Input|null>(null)
    const [inputs, setInputs] = React.useState<Input[]>([])

    const focusInput = (id: string) => {
        setFocusedInput(inputs.find((input) => input.id === id) ?? null)
    }

    const focusNext = () => {
        inputs.forEach((input, i) => {
            if (input.id !== focusedInput?.id) {
                return
            }

            const nextInput = inputs[i + 1]

            if (nextInput) {
                nextInput.ref.current?.focus()
            }
        })
    }

    const focusPrevious = (options: focusPreviousOptions|undefined) => {
        let id: string|null = null

        inputs.forEach((input, i) => {
            if (input.id !== focusedInput?.id) {
                return input
            }

            const previousInput = inputs[i - 1]

            if (previousInput && previousInput.ref.current) {
                id = previousInput.id
                const current = previousInput.ref.current
                current.focus()
            }
        })

        setInputs((inputs) => {
            return inputs.map((input, i) => {
                if (input.id !== id) {
                    return input
                }

                return {
                    ...input,
                    ...(options?.removeValue ? {value: null} : {})
                }
            })
        })
    }

    const checkForCompletion = (inputs: Input[]) => {
        const isNotComplete = inputs.find((input) => input.value === null)

        if (isNotComplete) {
            return
        }

        focusedInput?.ref.current?.blur()

        onCompletion && onCompletion(inputs.reduce((acc, input) => `${acc}${input.value}`, ""))
    }

    const handleChange = (value: number|null, id: string) => {
        setInputs && setInputs((inputs) => {
            const newInputs = inputs.map((input) => {
                if (input.id === id) {
                    return {
                        ...input,
                        value
                    }
                }
                return input
            })

            checkForCompletion(newInputs)

            return newInputs
        })

        setFocusedInput((input) => {
            if (!input) {
                return null
            }
            return {...input, value}
        })
    }

    return (
        <PinCodeContext.Provider value={{inputs, setInputs, handleChange, focusInput, focusNext, focusPrevious}}>
            <div className={cn(className, "flex")} {...props}>
                {children}
            </div>
        </PinCodeContext.Provider>
    )
}
PinCode.displayName = "PinCode"

export {PinCode, PinCodeInput}
