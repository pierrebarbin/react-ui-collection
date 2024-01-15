import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { NumberButton, NumberInput, NumberRoot } from '@/Components/number';
import AppLayout from '@/Layouts/app-layout';

export default function App({ }: PageProps) {
    return (
        <AppLayout>
            <Head title="Welcome" />
            <NumberRoot onValueChange={(value) => console.log(value)}>
                <NumberButton offset={0.11}>
                    TEst
                </NumberButton>
                <NumberInput />
            </NumberRoot>
        </AppLayout>
    );
}
