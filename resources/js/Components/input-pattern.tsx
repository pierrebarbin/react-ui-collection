import React from "react";

interface InputPatternProps {
    pattern: string
}

interface Part {
    editable: boolean
    display: string
    count: number
}

const InputPattern = ({ pattern }: InputPatternProps) => {
    const [parts, setParts] = React.useState<Part[]>(() => {
        return [...pattern.matchAll(/(?<group1>[x]+)(?<group2>[^x]*)/g)].map((pattern) => {
            return Object.entries((pattern.groups ?? {}))
                .map(([key, value]) => value)
                .map((part) => part.replaceAll('x', '_'))
        })
            .flat()
            .filter((part) => part !== "")
            .map((part) => ({
                editable: part.includes('_'),
                display: part,
                count: part.length
            }))
    })

    const handleInput = (key: string, index: number) => {
        const isBackspace = key === "Backspace"
        setParts(() => {
            return parts.map((part, i) => {
                if (!part.editable) {
                    return part
                }

                const display = part.display.replaceAll('_', '')

                if (isBackspace) {
                    const base = [...Array(part.count).keys()].reduce((acc) => `${acc}_`, '')

                    if (display === "") {
                        return {
                            ...part,
                            display: base
                        }
                    }

                    const sliced = display.slice(0, -1)

                    return {
                        ...part,
                        display: sliced === "" ? base : sliced
                    }
                }

                if (part.count === display.length) {
                    return part
                }

                if (i === index) {
                    return {
                        ...part,
                        display: `${display}${key}`
                    }
                }

                return part
            })
        })
    }

    return (
        <div className="flex">
            {parts.map((part, i) => (
                <div
                     key={i}
                     contentEditable={part.editable}
                     suppressContentEditableWarning={true}
                     onKeyDown={(e) => {
                         e.preventDefault()
                         handleInput(e.key, i)
                     }}
                >{part.display}</div>
            ))}
        </div>
    )
}
InputPattern.displayName = "InputPattern"

export {InputPattern}
