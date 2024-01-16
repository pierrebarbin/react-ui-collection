import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { NumberButton, NumberInput, NumberRoot } from '@/Components/number';
import AppLayout from '@/Layouts/app-layout';
import { InputNumber } from '@/Components/input-number';

export default function App({ }: PageProps) {
    return (
        <AppLayout>
            <Head title="Welcome" />
            <InputNumber />
        </AppLayout>
    );
}
