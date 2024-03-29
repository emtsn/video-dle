import { AutoComplete } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useCallback, useMemo, useState } from 'react';
import { VideoData } from '../models/video-data';
import './GuessInput.scss';

/**
 * Minimum chars required for valid search.
 * At least one word must be as long as this value to be a valid search.
 */
const SEARCH_MIN_CHAR = 3 as const;
/**
 * Minimum chars required in a word to be considered in the search algorithm
 */
const SEARCH_MIN_WORD_CHAR = 2 as const;

interface OptionWithSearchKey extends DefaultOptionType {
    key: string;
    label: React.ReactNode;
    value: string;
    searchKeys: string[];
}

type Props = {
    vidData: VideoData[];
    handleSelect: (videoId: string) => void;
    disabled?: boolean;
};

export default function GuessInput({ vidData, handleSelect, disabled }: Props): React.ReactElement {
    const [options, setOptions] = useState<DefaultOptionType[]>([]);
    const [searchInput, setSearchInput] = useState<string>('');
    const vidDataOptions: OptionWithSearchKey[] = useMemo(() => {
        return vidData.map((vid) => {
            const searchTitle = vid.title.toUpperCase();
            const searchUploaderName = vid.uploaderName.toUpperCase();
            const additionalKeys = vid.additionalKeys?.map((x) => x.toUpperCase()) ?? [];
            return {
                key: vid.videoId,
                label: (
                    <div className="guess-input-option">
                        <div className="guess-input-option-title">{vid.title}</div>
                        <div className="guess-input-option-uploader">{vid.uploaderName}</div>
                    </div>
                ),
                value: vid.title,
                searchKeys: [
                    ...searchTitle.split(' '),
                    ...searchUploaderName.split(' '),
                    searchTitle.replaceAll(' ', ''),
                    searchUploaderName.replaceAll(' ', ''),
                    ...additionalKeys,
                ],
            };
        });
    }, [vidData]);
    const handleSearch = useCallback(
        (value: string | undefined): void => {
            if (!value || value.length < SEARCH_MIN_CHAR || vidDataOptions.length <= 0) {
                setOptions([]);
            } else {
                const searchValues: string[] = value.split(' ').filter((x) => x.length >= SEARCH_MIN_WORD_CHAR);
                if (searchValues.filter((x) => x.length >= SEARCH_MIN_CHAR).length < 1) {
                    setOptions([]);
                } else {
                    setOptions(
                        vidDataOptions.filter((option) =>
                            searchValues.every((searchValue) =>
                                option.searchKeys.some((searchKey) => searchKey.includes(searchValue.toUpperCase()))
                            )
                        )
                    );
                }
            }
        },
        [vidDataOptions]
    );

    return (
        <AutoComplete
            className="guess-input"
            options={options}
            onSearch={handleSearch}
            onSelect={(_, option): void => {
                setSearchInput('');
                setOptions([]);
                handleSelect(option.key);
            }}
            onChange={(e) => setSearchInput(e)}
            value={searchInput}
            defaultOpen={false}
            showSearch={true}
            filterOption={false}
            size={'large'}
            disabled={!!disabled}
            notFoundContent={false}
            placeholder="Video Title..."
        >
            {/* <Input.Search size="large" placeholder="Video Title..." enterButton /> */}
        </AutoComplete>
    );
}
