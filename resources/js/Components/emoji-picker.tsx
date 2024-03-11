import React from "react";
import emoji from "@/Data/emoji.json"
import Fuse from "fuse.js";
import {Input} from "@/Components/ui/input";

interface EmojiPickerContextType {

}

const EmojiPickerContext = React.createContext<EmojiPickerContextType>({

})


interface EmojiPickerProps {}

const SCORE_THRESHOLD = 0.4

const EmojiPicker = ({ children }: EmojiPickerProps) => {
    const [searchValue, setSearchValue] = React.useState('')

    const fuse = React.useMemo(() => {
        const options = {
            includeScore: true,
            keys: ["name"],
        }

        return new Fuse(emoji.emojis, options)
    }, [])

    const results = React.useMemo(() => {
        if (!searchValue) return emoji.emojis

        const searchResults = fuse.search(searchValue)

        return searchResults
            .filter((fuseResult) => fuseResult.score < SCORE_THRESHOLD)
            .map((fuseResult) => fuseResult.item)
    }, [fuse, searchValue])

    return (
        <EmojiPickerContext.Provider value={{}}>
            <Input onChange={(e) => setSearchValue(e.target.value)} />
            {results.map((result) => (
                <div>{result.emoji}</div>
            ))}
        </EmojiPickerContext.Provider>
    )
}

export {EmojiPicker}
