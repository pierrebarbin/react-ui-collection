import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/Layouts/app-layout';
import { InputNumber, InputNumberDecrease, InputNumberIncrease, InputNumberInput } from '@/Components/input-number';
import { InputPinCode, InputPinCodeInput } from '@/Components/input-pin-code';

export default function App({ }: PageProps) {
    return (
        <AppLayout>
            <Head title="Welcome" />
            <div className="space-y-6">
                <InputNumber digits={0} min={-1} max={9} >
                    <InputNumberDecrease />
                    <InputNumberInput />
                    <InputNumberIncrease />
                </InputNumber>
                <InputNumber className="relative">
                    <InputNumberInput className="w-full text-left rounded"/>
                    <InputNumberDecrease className="absolute right-[45px] rounded top-1/2 -translate-y-1/2 z-20" />
                    <InputNumberIncrease className="absolute right-[3px] rounded top-1/2 -translate-y-1/2 z-20" />
                </InputNumber>
                <InputPinCode onPinEntered={(pin) => console.log(pin)}>
                    {[...Array(4).keys()].map((input) => (
                        <InputPinCodeInput key={input} />
                    ))}
                </InputPinCode>
            </div>
        </AppLayout>
    );
}
