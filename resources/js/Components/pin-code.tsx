import { InputNumber, InputNumberInput } from "./input-number"
import React from "react"
import { cn } from "@/lib/utils"

type Input = {
    id: string
    ref: React.RefObject<HTMLInputElement>
    value: number|null
}

type PinCodeContextType = {
    inputs: Input[],
    setInputs: React.Dispatch<React.SetStateAction<Array<Input>>>|null
    handleChange: (value: number|null, id: string) => void
    focusInput: (id: string) => void
    focusNext: () => void
    focusPrevious: () => void
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
    const ref = React.useRef(null)

    const id = React.useId()
    const {
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.code === "Backspace") {
            focusPrevious()
        }
    }

    return (
        <InputNumber
            onValueChange={(value) => handleChange(value, id)}
            digits={0}
            min={0}
            max={9}
        >
            <InputNumberInput
                ref={ref}
                onFocus={() => focusInput(id)}
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

    const focusPrevious = () => {
        inputs.forEach((input, i) => {
            if (input.id !== focusedInput?.id) {
                return
            }

            const previousInput = inputs[i - 1]

            if (previousInput) {
                previousInput.ref.current?.focus()
            }
        })
    }

    const checkForCompletion = (inputs: Input[]) => {
        const isNotComplete = inputs.find((input) => input.value === null)

        if (isNotComplete) {
            return
        }

        onCompletion && onCompletion(inputs.reduce((acc, input) => `${acc}${input.value}`, ""))
    }

    const handleChange = (value: number|null, id: string) => {
        setInputs && setInputs((inputs) => {
            const newInputs = inputs.map((input, i) => {
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

        focusNext()
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
