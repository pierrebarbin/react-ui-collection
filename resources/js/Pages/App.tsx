import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/Layouts/app-layout';
import { InputNumber, InputNumberDecrease, InputNumberIncrease, InputNumberInput } from '@/Components/input-number';
import { PinCode, PinCodeInput } from '@/Components/pin-code';
import {
    EmojiPicker,
    EmojiPickerCategories, EmojiPickerContent,
    EmojiPickerInput, EmojiPickerPopover, EmojiPickerPopoverContent,
    EmojiPickerPopoverTrigger
} from "@/Components/emoji-picker";

export default function App({ }: PageProps) {
    return (
        <AppLayout>
            <Head title="Welcome" />
            <div className="space-y-6">
                <InputNumber digits={2} min={-1} max={9000} >
                    <InputNumberDecrease />
                    <InputNumberInput />
                    <InputNumberIncrease />
                </InputNumber>
                <InputNumber className="relative">
                    <InputNumberInput className="w-full text-left rounded"/>
                    <InputNumberDecrease className="absolute right-[45px] rounded top-1/2 -translate-y-1/2 z-20" />
                    <InputNumberIncrease className="absolute right-[3px] rounded top-1/2 -translate-y-1/2 z-20" />
                </InputNumber>
                <PinCode onCompletion={console.log} className="gap-2">
                    {[...Array(4).keys()].map((input) => (
                        <PinCodeInput key={input} className="w-12 h-12 first:rounded-l last:rounded-r"/>
                    ))}
                </PinCode>
                <EmojiPicker>
                    <EmojiPickerPopover>
                        <EmojiPickerPopoverTrigger>Test</EmojiPickerPopoverTrigger>
                        <EmojiPickerPopoverContent align="start">
                            <EmojiPickerInput />
                            <EmojiPickerCategories />
                            <EmojiPickerContent />
                        </EmojiPickerPopoverContent>
                    </EmojiPickerPopover>
                </EmojiPicker>
            </div>
        </AppLayout>
    );
}
