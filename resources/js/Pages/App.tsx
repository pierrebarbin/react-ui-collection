import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { NumberIncrease, NumberInput, NumberRoot } from '@/Components/number';

export default function App({ }: PageProps) {
    return (
        <>
            <Head title="Welcome" />
            <NumberRoot>
                <NumberIncrease>
                    TEst
                </NumberIncrease>
                <NumberInput />
            </NumberRoot>
        </>
    );
}
