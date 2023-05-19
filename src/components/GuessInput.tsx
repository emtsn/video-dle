import { AutoComplete } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useEffect, useState } from 'react';
import { VideoData } from '../models/video-data';

const SEARCH_MIN_CHAR = 3 as const;

interface OptionWithSearchKey extends DefaultOptionType {
    key: string,
    label: string,
    value: string,
    searchKeys: string[]
};

export default function GuessInput({ vidData, handleSelect, disabled }: { vidData: VideoData[], handleSelect: (videoId: string) => void, disabled?: boolean }): React.ReactElement {
    const [vidDataOptions, setVidDataOptions] = useState<OptionWithSearchKey[]>([]);
    const [options, setOptions] = useState<DefaultOptionType[]>([]);

    useEffect(() => {
        setVidDataOptions(vidData.map(vid => {
            const searchTitle = vid.title.toUpperCase();
            const searchUploaderName = vid.uploaderName.toUpperCase();
            return {
                key: vid.videoId,
                label: vid.title,
                value: vid.title,
                searchKeys: [...searchTitle.split(' '), ...searchUploaderName.split(' '), searchTitle.replaceAll(' ', ''), searchUploaderName.replaceAll(' ', '')]
            };
        }));
    }, [vidData]);

    function handleSearch(value: string | undefined): void {
        if (!value || value.length < SEARCH_MIN_CHAR || vidData.length <= 0) {
            setOptions([]);
        } else {
            const searchValues: string[] = value.split(' ').filter(x => x.length >= SEARCH_MIN_CHAR);
            if (searchValues.length < 1) {
                setOptions([]);
            } else {
                setOptions(vidDataOptions.filter(option => searchValues.every(searchValue => option.searchKeys.some(searchKey => searchKey.includes(searchValue.toUpperCase())))));
            }
        }
    }

    return <AutoComplete
        className="guess-input"
        options={options}
        onSearch={handleSearch}
        onSelect={(_, option): void => handleSelect(option.key)}
        defaultOpen={false}
        showSearch={true}
        filterOption={false}
        size={'large'}
        style={{ width: '100%' }}
        disabled={!!disabled}
        notFoundContent={false}
        placeholder="Video Title..."
    >
        {/* <Input.Search size="large" placeholder="Video Title..." enterButton /> */}
    </AutoComplete>;
}
