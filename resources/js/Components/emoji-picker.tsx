import React, {ChangeEvent, ReactElement, useDeferredValue} from "react";
import Fuse from "fuse.js";
import {Input} from "@/Components/ui/input";
import {useVirtualizer} from "@tanstack/react-virtual";
import {cn} from "@/lib/utils";
import {Button, ButtonProps} from "@/Components/ui/button";
import {ScrollArea, ScrollBar} from "@/Components/ui/scroll-area";

export interface Emoji {
    "code": string[],
    "emoji": string,
    "name": string,
    "category": string,
    "subcategory": string
}

interface EmojiPickerContextType {
    emojis: Emoji[]
    allEmojis: Emoji[]
    selectedCategory: string|null
    selectEmoji: (emoji: Emoji) => void
    updateSearch: (value: string) => void
    updateCategory: (value: string|null) => void
}

const EmojiPickerContext = React.createContext<EmojiPickerContextType>({
    emojis: [],
    allEmojis: [],
    selectedCategory: null,
    selectEmoji: () => {},
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
    source: Emoji[]
    onEmojiSelected?: (emoji: Emoji) => void
}

const SCORE_THRESHOLD = 0.4

const EmojiPicker = ({ source, children, onEmojiSelected }: EmojiPickerProps) => {
    const [searchValue, setSearchValue] = React.useState('')
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)

    const deferredSearchValue = useDeferredValue(searchValue);

    const fuse = React.useMemo(() => {
        const options = {
            includeScore: true,
            keys: ["name"],
        }

        return new Fuse(source, options)
    }, [])

    const searchResults = React.useMemo(() => {
        if (!deferredSearchValue) {
            return source
        }

        return fuse.search(deferredSearchValue)
            .filter((fuseResult) => (fuseResult.score ?? 0) < SCORE_THRESHOLD)
            .map((fuseResult) => fuseResult.item)
    }, [fuse, deferredSearchValue])

    const emojis = React.useMemo(() => {
        if (!selectedCategory) {
            return searchResults
        }

        return searchResults.filter((emoji) => emoji.category === selectedCategory)
    }, [searchResults, selectedCategory])

    const updateSearch = (value: string) => {
        setSearchValue(value)
    }

    const updateCategory = (value: string | null) => {
        setSelectedCategory(value)
    }

    const selectEmoji = (emoji: Emoji) => {
        onEmojiSelected && onEmojiSelected(emoji)
    }

    return (
        <EmojiPickerContext.Provider value={{
            selectedCategory,
            updateSearch,
            updateCategory,
            selectEmoji,
            emojis,
            allEmojis: source,
        }}>
            {children}
        </EmojiPickerContext.Provider>
    )
}

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
            placeholder="Search..."
            {...props}
        />
    )
})
EmojiPickerInput.displayName = "EmojiPickerInput"

interface EmojiPickerCategoriesItemProps
    extends ButtonProps {
    category: string|null
}

const EmojiPickerCategoriesItem = React.forwardRef<HTMLButtonElement, EmojiPickerCategoriesItemProps>(
    ({ children, category, ...props }, ref) => {
        const { updateCategory } = useEmojiPicker()

        return (
            <Button
                ref={ref}
                onClick={() => updateCategory(category)}
                {...props}
            >
                {children}
            </Button>
        )
    })
EmojiPickerCategoriesItem.displayName = "EmojiPickerCategoriesItem"

export interface EmojiPickerCategoriesProps
    extends React.HTMLAttributes<HTMLDivElement> {}

const EmojiPickerCategories = ({ className, ...props }: EmojiPickerCategoriesProps) => {

    const { allEmojis, selectedCategory} = useEmojiPicker()

    const categories = React.useMemo(() => {
        return allEmojis
            .map((emoji) => emoji.category)
            .filter(
                (value, index, current_value) => current_value.indexOf(value) === index
            )
    }, [])

    return (
        <ScrollArea className="w-full whitespace-nowrap">
            <div className={cn(className, "flex gap-1 p-1 pb-3")} {...props}>
                <EmojiPickerCategoriesItem
                    category={null}
                    variant={selectedCategory === null ? "secondary" : "ghost"}
                >
                    All
                </EmojiPickerCategoriesItem>
                {categories.map((category) => (
                    <EmojiPickerCategoriesItem
                        category={category}
                        variant={selectedCategory === category ? "secondary" : "ghost"}
                        key={category}
                    >
                        {category}
                    </EmojiPickerCategoriesItem>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}
EmojiPickerCategories.displayName = "EmojiPickerCategories"

interface EmojiPickerContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const EmojiPickerContent = ({ className, ...props }: EmojiPickerContentProps) => {
    const [containerWidth, setContainerWidth] = React.useState(0)

    const parentRef = React.useRef<HTMLDivElement>(null)

    const { emojis, selectEmoji } = useEmojiPicker()

    const height = 50
    const width = 50
    const columns = Math.ceil((containerWidth) / width) - 1
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
        estimateSize: () => width,
        overscan: 5,
    })

    React.useEffect(() => {
        if (parentRef.current?.clientWidth) {
            setContainerWidth(parentRef.current?.clientWidth)
        }
    }, [])

    React.useEffect(() => {
        parentRef.current?.scrollTo(0, 0);
    }, [emojis])

    return (
        <div
            ref={parentRef}
            className={cn(className, "h-80 w-full overflow-x-hidden overflow-y-auto")}
        >
            <div
                className="relative mx-auto"
                style={{
                    height: `${rowVirtualizer.getTotalSize() + 4 }px`,
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
                                    onClick={() => selectEmoji(emoji)}
                                    className="absolute flex justify-center items-center text-3xl top-0 left-0"
                                    style={{
                                        width: `${virtualColumn.size}px`,
                                        height: `${virtualRow.size}px`,
                                        transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start + 2}px)`,
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
EmojiPickerContent.displayName = "EmojiPickerContent"

export {EmojiPicker, EmojiPickerInput, EmojiPickerCategories, EmojiPickerCategoriesItem, EmojiPickerContent}
