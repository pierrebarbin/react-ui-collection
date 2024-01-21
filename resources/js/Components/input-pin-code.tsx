import { useState } from "react"
import { InputNumber, InputNumberInput } from "./input-number"

interface InputPinCodeProps {
    digits?: number
}

const InputPinCode = ({ digits = 4 }: InputPinCodeProps) => {
    const [inputs, setInputs] = useState([...Array(digits).map(() => null).values()])

    const onChange = (value: number|null, index: number) => {
        
    }

    return (
        <div className="flex">
            {inputs.map((input, index) => (
                <InputNumber
                    onValueChange={(value) => onChange(value, index)}
                    digits={0}
                    min={0}
                    max={9}
                >
                    <InputNumberInput />
                </InputNumber>
            ))}
        </div>
    )
}
InputPinCode.displayName = "InputPinCode"

export {InputPinCode}