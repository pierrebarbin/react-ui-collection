import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/Layouts/app-layout';
import { InputNumber, InputNumberDecrease, InputNumberIncrease, InputNumberInput } from '@/Components/input-number';

export default function App({ }: PageProps) {
    return (
        <AppLayout>
            <Head title="Welcome" />
            <div className="space-y-6">
                <InputNumber onValueChange={(value) => console.log({value})} digits={3}>
                    <InputNumberDecrease />
                    <InputNumberInput />
                    <InputNumberIncrease />
                </InputNumber>
                <InputNumber className="relative">
                    <InputNumberInput className="w-auto text-left rounded"/>
                    <InputNumberDecrease className="absolute right-[45px] rounded top-1/2 -translate-y-1/2 z-20" />
                    <InputNumberIncrease className="absolute right-[3px] rounded top-1/2 -translate-y-1/2 z-20" />
                </InputNumber>
            </div>
        </AppLayout>
    );
}
