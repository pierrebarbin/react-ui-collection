import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/Layouts/app-layout';
import { InputNumber, InputNumberDecrease, InputNumberIncrease, InputNumberInput } from '@/Components/input-number';
import { PinCode, PinCodeInput } from '@/Components/pin-code';
import {
    Emoji,
    EmojiPicker,
    EmojiPickerCategories, EmojiPickerContent,
    EmojiPickerInput
} from "@/Components/emoji-picker";
import {Popover, PopoverContent, PopoverTrigger} from "@/Components/ui/popover";
import {useState} from "react";
import {Button} from "@/Components/ui/button";
import emoji from "@/Data/emoji.json"
import {
    Drawer, DrawerClose,
    DrawerContent,
    DrawerDescription, DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/Components/ui/drawer";
import {InputPattern} from "@/Components/input-pattern";

export default function App({ }: PageProps) {
    const [emoji1, setEmoji1] = useState<Emoji|null>(null)
    const [openEmoji1, setOpenEmoji1] = useState(false)

    const [emoji2, setEmoji2] = useState<Emoji|null>(null)
    const [openEmoji2, setOpenEmoji2] = useState(false)

    return (
        <AppLayout>
            <Head title="Welcome" />
            <div className="space-y-6">
                <InputNumber digits={2} min={-1} max={9000} >
                    <InputNumberDecrease className="rounded-r-none"/>
                    <InputNumberInput />
                    <InputNumberIncrease className="rounded-l-none"/>
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
                <EmojiPicker source={emoji.emojis} onEmojiSelected={(emoji) => {
                    setEmoji1(emoji)
                    setOpenEmoji1(false)
                }}>
                    <Popover open={openEmoji1} onOpenChange={setOpenEmoji1}>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                {emoji1 ? emoji1.emoji : "Emoji Popover"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" side="right">
                            <EmojiPickerInput />
                            <EmojiPickerCategories />
                            <EmojiPickerContent />
                        </PopoverContent>
                    </Popover>
                </EmojiPicker>
                <EmojiPicker source={emoji.emojis} onEmojiSelected={(emoji) => {
                    setEmoji2(emoji)
                    setOpenEmoji2(false)
                }}>
                    <Drawer open={openEmoji2} onOpenChange={setOpenEmoji2}>
                        <DrawerTrigger asChild>
                            <Button variant="outline">
                                {emoji2 ? emoji2.emoji : "Emoji Drawer"}
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <div className="mx-auto w-full max-w-sm">
                                <EmojiPickerInput />
                                <EmojiPickerCategories />
                                <EmojiPickerContent />
                            </div>
                        </DrawerContent>
                    </Drawer>
                </EmojiPicker>
                <InputPattern pattern="xx/xx/xxxx" />
            </div>
        </AppLayout>
    );
}
