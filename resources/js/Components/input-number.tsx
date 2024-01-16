import { MinusIcon, PlusIcon } from "@radix-ui/react-icons"
import { NumberRoot, NumberButton, NumberInput } from "./number"

const InputNumber = () => {
    return (
         <NumberRoot>
            <div className="flex">
                <NumberButton order="decrease" size="icon" variant="outline" className="py-2 px-3 h-auto w-auto rounded-r-none">
                    <MinusIcon className="w-3 h-3"  />
                </NumberButton>
                <NumberInput className="text-center rounded-none z-10"/>
                <NumberButton size="icon" variant="outline" className="py-2 px-3 h-auto w-auto rounded-l-none">
                    <PlusIcon className="w-3 h-3" />
                </NumberButton>
            </div>
        </NumberRoot>
        // <NumberRoot>
        //     <div className="relative">
        //         <NumberInput />
        //         <div className="absolute right-[3px] top-1/2 -translate-y-1/2 flex gap-1">
        //             <NumberButton order="decrease" size="icon" variant="outline" className="p-2 h-auto w-auto">
        //                 <MinusIcon className="w-3 h-3"  />
        //             </NumberButton>
        //             <NumberButton size="icon" variant="outline" className="p-2 h-auto w-auto">
        //                 <PlusIcon className="w-3 h-3" />
        //             </NumberButton>
        //         </div>
        //     </div>
        // </NumberRoot>
    )
}
InputNumber.displayName = "InputNumber"

export {InputNumber}