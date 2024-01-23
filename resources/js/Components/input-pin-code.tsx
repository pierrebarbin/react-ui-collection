import { useEffect, useId, useState } from "react"
import { InputNumber, InputNumberInput } from "./input-number"
import React from "react"

type Input = {
    id: string
    ref: React.RefObject<HTMLInputElement>
    value: number|null
}

type InputPinCodeContextType = {
    inputs: Array<Input>,
    setInputs: React.Dispatch<React.SetStateAction<Array<Input>>>|null
}

const InputPinCodeContext = React.createContext<InputPinCodeContextType>({
    inputs: [],
    setInputs: null
})

const useInputPinCode = () => {
    const inputPinCodeContext = React.useContext(InputPinCodeContext)

    if (!inputPinCodeContext) {
        throw new Error(
          "useInputPinCode has to be used within <InputPinCodeContext.Provider>"
        )
    }

    return inputPinCodeContext
}

const InputPinCodeInput = () => {

    const ref = React.useRef(null)

    const id = useId()
    const {setInputs} = useInputPinCode()

    useEffect(() => {
        setInputs && setInputs((inputs) => [...inputs, {id, ref, value: null}])
    }, [])

    const onChange = (value: number|null) => {
        setInputs && setInputs((inputs) => {
            return inputs.map((input, i) => {
                if (input.id === id) {

                    const nextInput = inputs[i + 1]

                    if (nextInput) {
                        nextInput.ref.current?.focus()
                    }

                    return {
                        ...input,
                        value
                    }
                }
                return input
            })
        })
    }

    return (
        <InputNumber
            onValueChange={onChange}
            digits={0}
            min={0}
            max={9}
        >
            <InputNumberInput ref={ref} className="focus:z-20" />
        </InputNumber>
    )
}

interface InputPinCodeProps {
    digits?: number
    onPinEntered?: (pin: string) => void
}

const InputPinCode = ({ digits = 4, onPinEntered }: InputPinCodeProps) => {
    const [inputs, setInputs] = useState<Array<Input>>([])

    useEffect(() => {
        const isNotEntered = inputs.find((input) => input.value === null)

        if (isNotEntered) {
            return
        }

        onPinEntered && onPinEntered(inputs.reduce((acc, input) => `${acc}${input.value}`, ""))
    }, [inputs])

    return (
        <InputPinCodeContext.Provider value={{inputs, setInputs}}>
            <div className="flex">
                {[...Array(digits).keys()].map((input) => (
                    <InputPinCodeInput key={input} />
                ))}
            </div>
        </InputPinCodeContext.Provider>
    )
}
InputPinCode.displayName = "InputPinCode"

export {InputPinCode}