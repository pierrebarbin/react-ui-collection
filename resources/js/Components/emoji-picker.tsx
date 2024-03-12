import React, {ChangeEvent, ReactElement} from "react";
import emoji from "@/Data/emoji.json"
import Fuse from "fuse.js";
import {Input} from "@/Components/ui/input";
import {useVirtualizer} from "@tanstack/react-virtual";
import {cn} from "@/lib/utils";
import {Button} from "@/Components/ui/button";
import {Popover, PopoverContent, PopoverContentProps, PopoverRef, PopoverTrigger} from "@/Components/ui/popover";

interface Emoji {
    "code": string[],
    "emoji": string,
    "name": string,
    "category": string,
    "subcategory": string
}

interface EmojiPickerContextType {
    emojis: Emoji[]
    allEmojis: Emoji[]
    updateSearch: (value: string) => void
    updateCategory: (value: string|null) => void
}

const EmojiPickerContext = React.createContext<EmojiPickerContextType>({
    emojis: [],
    allEmojis: [],
    updateSearch: () => {},
    updateCategory: () => {},
})

const useEmojiPicker = () => {
    const context = React.useContext(EmojiPickerContext)

    if (!context) {
        throw new Error(
            "useEmojiPicker has to be used within <EmojiPickerContext.Provider>"
        )
    }

    return context
}

interface EmojiPickerProps {
    children: ReactElement|ReactElement[]
}

const SCORE_THRESHOLD = 0.4

const EmojiPicker = ({ children }: EmojiPickerProps) => {
    const [searchValue, setSearchValue] = React.useState('')
    const [selectedCategory, setSelectedCategory] = React.useState<string|null>(null)

    const fuse = React.useMemo(() => {
        const options = {
            includeScore: true,
            keys: ["name"],
        }

        return new Fuse(emoji.emojis, options)
    }, [])

    const searchResults = React.useMemo(() => {
        if (!searchValue) {
            return emoji.emojis
        }

        return fuse.search(searchValue)
            .filter((fuseResult) => (fuseResult.score ?? 0) < SCORE_THRESHOLD)
            .map((fuseResult) => fuseResult.item)
    }, [fuse, searchValue])

    const emojis = React.useMemo(() => {
        if (!selectedCategory) {
            return searchResults
        }

        return searchResults.filter((emoji) => emoji.category === selectedCategory)
    }, [searchResults, selectedCategory])


    const updateSearch = (value: string) => {
        setSearchValue(value)
    }

    const updateCategory = (value: string|null) => {
        setSelectedCategory(value)
    }

    return (
        <EmojiPickerContext.Provider value={{updateSearch, updateCategory, emojis, allEmojis: emoji.emojis,}}>
            {children}
        </EmojiPickerContext.Provider>
    )
}

const EmojiPickerPopover = Popover

EmojiPickerPopover.displayName = "EmojiPickerPopover"

const EmojiPickerPopoverTrigger = PopoverTrigger

EmojiPickerPopoverTrigger.displayName = "EmojiPickerTrigger"

export interface EmojiPickerContentPopoverProps
    extends PopoverContentProps {}

const EmojiPickerPopoverContent = React.forwardRef<PopoverRef, EmojiPickerContentPopoverProps>(
({ children, className, ...props }, ref) => {
    return (
        <PopoverContent ref={ref} className={cn(className)} {...props}>
            {children}
        </PopoverContent>
    )
})
EmojiPickerPopoverContent.displayName = "EmojiPickerContent"

export interface EmojiPickerInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {}

const EmojiPickerInput = React.forwardRef<HTMLInputElement, EmojiPickerInputProps>(
({ className, ...props }, ref) => {

    const { updateSearch } = useEmojiPicker()

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        updateSearch(e.target.value)
    }

    return (
        <Input
            ref={ref}
            onChange={handleChange}
            {...props}
        />
    )
})
EmojiPickerInput.displayName = "EmojiPickerInput"

export interface EmojiPickerCategoriesProps
    extends React.HTMLAttributes<HTMLDivElement> {}

const EmojiPickerCategories = ({ className, ...props }: EmojiPickerCategoriesProps) => {

    const { allEmojis, updateCategory } = useEmojiPicker()

    const categories = React.useMemo(() => {
        return allEmojis
            .map((emoji) => emoji.category)
            .filter(
                (value, index, current_value) => current_value.indexOf(value) === index
            )
    }, [])

    return (
        <div className={cn(className, "flex gap-1")} {...props}>
            <Button
                variant="ghost"
                onClick={() => updateCategory(null)}
            >
                All
            </Button>
            {categories.map((category) => (
                <Button
                    variant="ghost"
                    key={category}
                    onClick={() => updateCategory(category)}
                >
                    {category}
                </Button>
            ))}
        </div>
    )
}
EmojiPickerCategories.displayName = "EmojiPickerCategories"

interface EmojiPickerContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const EmojiPickerContent = ({ className, ...props }: EmojiPickerContentProps) => {
    const [width, setWidth] = React.useState(0)

    const parentRef = React.useRef<HTMLDivElement>(null)

    const { emojis } = useEmojiPicker()

    const height = 50
    const ewidth = 50
    const columns = Math.ceil((width) / ewidth) - 1
    const rows = Math.round(emojis.length / columns)

    const rowVirtualizer = useVirtualizer({
        count: rows,
        getScrollElement: () => parentRef.current,
        estimateSize: () => height,
        overscan: 5,
    })

    const columnVirtualizer = useVirtualizer({
        horizontal: true,
        count: columns,
        getScrollElement: () => parentRef.current,
        estimateSize: () => ewidth,
        overscan: 5,
    })

    React.useEffect(() => {
        if (parentRef.current?.clientWidth) {
            setWidth(parentRef.current?.clientWidth)
        }
    }, [parentRef])

    return (
        <div
            ref={parentRef}
            className={cn(className, "h-96 w-full overflow-x-hidden overflow-y-auto")}
        >
            <div
                className="relative mx-auto"
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: `${columnVirtualizer.getTotalSize()}px`,
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                    <React.Fragment key={virtualRow.key}>
                        {columnVirtualizer.getVirtualItems().map((virtualColumn) => {
                            const emoji = emojis[(virtualRow.index * columns) + virtualColumn.index]

                            if (!emoji) {
                                return null
                            }

                            return (
                                <Button
                                    variant="ghost"
                                    key={virtualColumn.key}
                                    className="flex justify-center items-center text-3xl"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: `${virtualColumn.size}px`,
                                        height: `${virtualRow.size}px`,
                                        transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    {emoji.emoji}
                                </Button>
                            )
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

export {EmojiPicker, EmojiPickerPopover, EmojiPickerPopoverTrigger, EmojiPickerPopoverContent, EmojiPickerInput, EmojiPickerCategories, EmojiPickerContent}
