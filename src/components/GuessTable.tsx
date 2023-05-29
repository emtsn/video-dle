import React, { ReactElement, useMemo } from 'react';
import { TableColumnsType, ConfigProvider, Empty, Space, Table, Tag, Tooltip } from 'antd';
import { VideoData } from '../models/video-data';
import { AnswerData } from '../models/answer-data';
import { ArrowDownOutlined, ArrowUpOutlined, SearchOutlined } from '@ant-design/icons';
import './GuessTable.scss';
import { Dictionary, TagDescDictionary } from '../models/tags';
import { countFormatter, timeFormatter } from '../utils/format-util';

/**
 * Format a set of tags
 * @param tags
 * @param tagTooltipDict
 * @returns
 */
function tagsFormatter(tags: string[], tagTooltipDict?: Dictionary): ReactElement {
    if (tagTooltipDict !== undefined) {
        return (
            <Space direction="vertical">
                {tags.map((tagText, index) => {
                    const tagElement = (
                        <Tag key={index} style={{ border: '1px solid #000000' }} color="default" bordered={true}>
                            {tagText}
                        </Tag>
                    );
                    // if (tagTooltipDict[tagText]) {
                    //     return <Tooltip placement='right' title={tagTooltipDict[tagText]}>{tagElement}</Tooltip>;
                    // }
                    return tagElement;
                })}
            </Space>
        );
    }
    return (
        <Space direction="vertical">
            {tags.map((x, index) => (
                <Tag key={index} style={{ border: '1px solid #000000' }} color="default" bordered={true}>
                    {x}
                </Tag>
            ))}
        </Space>
    );
}

/**
 * Format a date string
 * @param date
 * @returns
 */
function dateFormatter(date: string): string {
    return date;
    // return new Date(date).toDateString();
}

/**
 * Where the answer is relative to the guess
 */
enum AnswerRelative {
    None,
    Equal,
    NotEqual,
    Close,
    Below,
    Above,
    SlightlyBelow,
    SlightlyAbove,
}

/**
 * Get AnswerRelative based on string answerValue and guessValue
 * @param answerValue
 * @param guessValue
 * @returns
 */
function stringsToAnswerRelative(answerValue: string | undefined, guessValue: string | undefined): AnswerRelative {
    if (answerValue === undefined && guessValue === undefined) return AnswerRelative.Equal;
    if (answerValue === undefined || guessValue === undefined) return AnswerRelative.NotEqual;
    return answerValue === guessValue ? AnswerRelative.Equal : AnswerRelative.NotEqual;
}

const NUM_CLOSE_THRESHOLD = 0.3 as const;

/**
 * Get AnswerRelative based on a number answerValue and guessValue
 * Slightly Above/Below is based if guess is between CLOSE_THRESHOLD % of answer
 * @param answerValue
 * @param guessValue
 * @returns
 */
function numbersToAnswerRelative(answerValue: number | undefined, guessValue: number | undefined): AnswerRelative {
    if (answerValue === undefined) answerValue = 0;
    if (guessValue === undefined) guessValue = 0;
    const diff = answerValue - guessValue;
    if (diff < 1 && diff > -1) return AnswerRelative.Equal;
    if (
        guessValue <= answerValue + answerValue * NUM_CLOSE_THRESHOLD &&
        guessValue >= answerValue - answerValue * NUM_CLOSE_THRESHOLD
    ) {
        return answerValue > guessValue ? AnswerRelative.SlightlyAbove : AnswerRelative.SlightlyBelow;
    }
    return answerValue > guessValue ? AnswerRelative.Above : AnswerRelative.Below;
}

const MS_IN_DAY = 86400000 as const;
const DATE_CLOSE_THRESHOLD = 30 as const;

/**
 * Get AnswerRelative based on a date answerValue and guessValue
 * @param answerValue
 * @param guessValue
 * @returns
 */
function dateToAnswerRelative(answerValue: string | undefined, guessValue: string | undefined): AnswerRelative {
    if (answerValue === guessValue) return AnswerRelative.Equal;
    const answerValueDate = answerValue !== undefined ? Date.parse(answerValue) : 0;
    const guessValueDate = guessValue !== undefined ? Date.parse(guessValue) : 0;
    const dayDiff = Math.abs(answerValueDate - guessValueDate) / MS_IN_DAY;
    if (dayDiff <= DATE_CLOSE_THRESHOLD) {
        return answerValueDate > guessValueDate ? AnswerRelative.SlightlyAbove : AnswerRelative.SlightlyBelow;
    }
    return answerValueDate > guessValueDate ? AnswerRelative.Above : AnswerRelative.Below;
}

/**
 * Get AnswerRelative based on tags
 * @param guessTags
 * @param answerTags
 * @returns
 */
function tagsToAnswerRelative(answerTags: string[] | undefined, guessTags: string[] | undefined): AnswerRelative {
    if (answerTags === undefined) answerTags = [];
    if (guessTags === undefined) guessTags = [];
    if (guessTags.length === 0 && answerTags.length === 0) return AnswerRelative.Equal;
    let correctGuessCount = 0;
    for (const guessTag of guessTags) {
        if (answerTags.includes(guessTag)) correctGuessCount++;
    }
    if (correctGuessCount < 1) return AnswerRelative.NotEqual;
    if (correctGuessCount < answerTags.length || correctGuessCount !== guessTags.length) return AnswerRelative.Close;
    return AnswerRelative.Equal;
}

const COLOR_CORRECT = 'color-correct';
const COLOR_CLOSE = 'color-close';
const COLOR_INCORRECT = 'color-incorrect';

type RenderedCell = {
    props: {
        className?: string;
    };
    children: React.ReactNode;
};

/**
 * Get a Table Cell for the label with AnswerRelative
 * @param label
 * @param ansRelative
 * @returns
 */
function createCell(label: string | React.ReactElement, ansRelative: AnswerRelative): React.ReactElement {
    let icon: React.ReactElement | undefined = undefined;
    switch (ansRelative) {
        case AnswerRelative.None:
            break;
        case AnswerRelative.Equal:
            icon = undefined; //<CheckOutlined />;
            break;
        case AnswerRelative.NotEqual:
            break;
        case AnswerRelative.Close:
            break;
        case AnswerRelative.SlightlyAbove:
            icon = <ArrowUpOutlined />;
            break;
        case AnswerRelative.Above:
            icon = <ArrowUpOutlined />;
            break;
        case AnswerRelative.SlightlyBelow:
            icon = <ArrowDownOutlined />;
            break;
        case AnswerRelative.Below:
            icon = <ArrowDownOutlined />;
            break;
    }
    return (
        <Space>
            {icon}
            <>{label}</>
        </Space>
    );
}

/**
 * Get props (i.e. className) for the table cell according to AnswerRelative
 * @param ansRelative
 * @returns
 */
function getCellProps(ansRelative: AnswerRelative): React.HTMLAttributes<any> {
    let colorClass: string | undefined = undefined;
    switch (ansRelative) {
        case AnswerRelative.None:
            break;
        case AnswerRelative.Equal:
            colorClass = COLOR_CORRECT;
            break;
        case AnswerRelative.NotEqual:
            colorClass = COLOR_INCORRECT;
            break;
        case AnswerRelative.Close:
            colorClass = COLOR_CLOSE;
            break;
        case AnswerRelative.SlightlyAbove:
            colorClass = COLOR_CLOSE;
            break;
        case AnswerRelative.Above:
            colorClass = COLOR_INCORRECT;
            break;
        case AnswerRelative.SlightlyBelow:
            colorClass = COLOR_CLOSE;
            break;
        case AnswerRelative.Below:
            colorClass = COLOR_INCORRECT;
            break;
    }
    return {
        className: colorClass,
    };
}

type Props = {
    vidData: Record<string, VideoData>;
    guessedVideos: string[];
    answer: AnswerData | null;
    showAnswer: boolean;
};

type VideoTableRow = VideoData & {
    key: string;
};

export default function GuessTable({ vidData, guessedVideos, answer, showAnswer }: Props): React.ReactElement {
    const answerData = answer != null ? vidData[answer.videoId] : null;
    const data: VideoTableRow[] = useMemo(() => {
        const vids: (VideoTableRow | null)[] = guessedVideos.map((x, index) => {
            if (vidData[x]) {
                return {
                    key: guessedVideos.length - 1 - index + '-' + vidData[x].videoId,
                    ...vidData[x],
                };
            }
            return null;
        });
        if (showAnswer && answerData != null && !guessedVideos.includes(answerData.videoId)) {
            vids.unshift({ key: 'answer-' + answerData.videoId, ...answerData });
        }
        return vids.filter((x) => x != null) as VideoTableRow[];
    }, [vidData, guessedVideos, answerData, showAnswer]);
    const columns: TableColumnsType<VideoData> = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: '30%',
            className: 'guess-table-col-title',
            render: (title) => createCell(title, AnswerRelative.None),
            onCell: () => getCellProps(AnswerRelative.None),
        },
        {
            title: 'Channel',
            dataIndex: 'uploaderName',
            key: 'uploaderName',
            width: '15%',
            render: (uploaderName) =>
                createCell(uploaderName, stringsToAnswerRelative(answerData?.uploaderName, uploaderName)),
            onCell: ({ uploaderName }) => getCellProps(stringsToAnswerRelative(answerData?.uploaderName, uploaderName)),
        },
        {
            title: 'Length',
            dataIndex: 'length',
            key: 'length',
            render: (length) => createCell(timeFormatter(length), numbersToAnswerRelative(answerData?.length, length)),
            onCell: ({ length }) => getCellProps(numbersToAnswerRelative(answerData?.length, length)),
        },
        {
            title: 'Views',
            dataIndex: 'views',
            key: 'views',
            render: (views) => createCell(countFormatter(views), numbersToAnswerRelative(answerData?.views, views)),
            onCell: ({ views }) => getCellProps(numbersToAnswerRelative(answerData?.views, views)),
        },
        {
            title: 'Likes',
            dataIndex: 'likes',
            key: 'likes',
            render: (likes) => createCell(countFormatter(likes), numbersToAnswerRelative(answerData?.likes, likes)),
            onCell: ({ likes }) => getCellProps(numbersToAnswerRelative(answerData?.likes, likes)),
        },
        {
            title: 'Comments',
            dataIndex: 'commentCount',
            key: 'commentCount',
            render: (commentCount) =>
                createCell(
                    countFormatter(commentCount),
                    numbersToAnswerRelative(answerData?.commentCount, commentCount)
                ),
            onCell: ({ commentCount }) => getCellProps(numbersToAnswerRelative(answerData?.commentCount, commentCount)),
        },
        {
            title: 'Uploaded',
            dataIndex: 'uploadDate',
            key: 'uploadDate',
            render: (uploadDate) =>
                createCell(dateFormatter(uploadDate), dateToAnswerRelative(answerData?.uploadDate, uploadDate)),
            onCell: ({ uploadDate }) => getCellProps(dateToAnswerRelative(answerData?.uploadDate, uploadDate)),
        },
        // {
        //     title: 'Original Creator',
        //     dataIndex: 'originalCreator',
        //     key: 'originalCreator'
        // },
        {
            title: 'Categories',
            dataIndex: 'categories',
            key: 'categories',
            render: (categories) =>
                createCell(
                    tagsFormatter(categories, TagDescDictionary),
                    tagsToAnswerRelative(answerData?.categories, categories)
                ),
            onCell: ({ categories }) => getCellProps(tagsToAnswerRelative(answerData?.categories, categories)),
        },
    ];
    return (
        <ConfigProvider
            renderEmpty={() => <Empty image={<SearchOutlined />} description="Enter a guess in the search to start!" />}
        >
            <Table
                className="guess-table"
                rowKey={'key'}
                dataSource={data}
                columns={columns}
                pagination={false}
            ></Table>
        </ConfigProvider>
    );
}
