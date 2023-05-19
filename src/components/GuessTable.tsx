import React, { ReactElement } from 'react';
import { TableColumnsType, ConfigProvider, Empty, Space, Table, Tag, Tooltip } from 'antd';
import { VideoData } from '../models/video-data';
import { AnswerData } from '../models/answer-data';
import { ArrowDownOutlined, ArrowUpOutlined, SearchOutlined, } from '@ant-design/icons';
import { green, orange, red } from '@ant-design/colors';
import './GuessTable.css';
import { Dictionary, TagDescDictionary } from '../models/tags';

const NUM_BILLION = 1000000000 as const;
const NUM_MILLION = 1000000 as const;
const NUM_THOUSAND = 1000 as const;

/**
 * Format a 'count' number as '?B', '?M', or '?K' string
 * @param count
 * @returns
 */
function countFormatter(count: number | undefined): string {
    if (count === undefined) return 'N/A';
    if (count > NUM_BILLION) return `${count / NUM_BILLION}B`;
    if (count > NUM_MILLION) return `${count / NUM_MILLION}M`;
    if (count > NUM_THOUSAND) return `${count / NUM_THOUSAND}K`;
    return count.toString();
}

/**
 * Format a 'time' number as '??:??:??' string
 * @param timeSeconds
 * @returns
 */
function timeFormatter(timeSeconds: number): string {
    const hours = Math.floor(timeSeconds / 3600);
    const minutes = Math.floor((timeSeconds % 3600) / 60);
    const seconds = (timeSeconds % 3600) % 60;
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format a set of tags
 * @param tags
 * @param tagTooltipDict
 * @returns
 */
function tagsFormatter(tags: string[], tagTooltipDict?: Dictionary): ReactElement {
    if (tagTooltipDict !== undefined) {
        return <Space direction='vertical'>{tags.map(tagText => {
            const tagElement = <Tag style={{ border: '1px solid #000000' }} color='default' bordered={true}>{tagText}</Tag>;
            // if (tagTooltipDict[tagText]) {
            //     return <Tooltip placement='right' title={tagTooltipDict[tagText]}>{tagElement}</Tooltip>;
            // }
            return tagElement;
        })}</ Space>;
    }
    return <Space direction='vertical'>{tags.map(x => <Tag style={{ border: '1px solid #000000' }} color='default' bordered={true}>{x}</Tag>)}</ Space>;
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


const NUM_CLOSE_THRESHOLD = 0.30 as const;

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
    if (guessValue <= answerValue + (answerValue * NUM_CLOSE_THRESHOLD) && guessValue >= answerValue - (answerValue * NUM_CLOSE_THRESHOLD)) {
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

const COLOR_GREEN = green[2];
const COLOR_RED = red[2];
const COLOR_ORANGE = orange[2];

type RenderedCell = {
    props: {
        style: React.CSSProperties,
    },
    children: React.ReactNode
}

/**
 * Get a coloured Table Cell for the label with AnswerRelative
 * @param label
 * @param ansRelative
 * @returns
 */
function colouredCell(label: string | React.ReactElement, ansRelative: AnswerRelative): RenderedCell {
    let bgColor: string | undefined = undefined;
    let icon: React.ReactElement | undefined = undefined;
    switch (ansRelative) {
        case AnswerRelative.None:
            break;
        case AnswerRelative.Equal:
            bgColor = COLOR_GREEN;
            icon = undefined; //<CheckOutlined />;
            break;
        case AnswerRelative.NotEqual:
            bgColor = COLOR_RED;
            break;
        case AnswerRelative.Close:
            bgColor = COLOR_ORANGE;
            break;
        case AnswerRelative.SlightlyAbove:
            bgColor = COLOR_ORANGE;
            icon = <ArrowUpOutlined />;
            break;
        case AnswerRelative.Above:
            bgColor = COLOR_RED;
            icon = <ArrowUpOutlined />;
            break;
        case AnswerRelative.SlightlyBelow:
            bgColor = COLOR_ORANGE;
            icon = <ArrowDownOutlined />;
            break;
        case AnswerRelative.Below:
            bgColor = COLOR_RED;
            icon = <ArrowDownOutlined />;
            break;
    }
    return {
        props: {
            style: {
                backgroundColor: bgColor
            }
        },
        children: <Space style={{ padding: '16px' }}>{icon}<>{label}</></Space>
    };
}

export default function GuessTable({ vidData, guessedVideos, answer }: { vidData: Record<string, VideoData>, guessedVideos: string[], answer: AnswerData | null }): React.ReactElement {
    const data = guessedVideos.map((x, index) => {
        return {
            key: guessedVideos.length - 1 - index + '-' + vidData[x].videoId,
            ...vidData[x]
        };
    });
    const answerData = answer != null ? vidData[answer.videoId] : null;
    const columns: TableColumnsType<VideoData> = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: '30%',
            className: 'guess-table-col-title',
            render: (title) => colouredCell(title, AnswerRelative.None)
        },
        {
            title: 'Uploader',
            dataIndex: 'uploaderName',
            key: 'uploaderName',
            width: '15%',
            render: (uploaderName) => colouredCell(uploaderName, stringsToAnswerRelative(answerData?.uploaderName, uploaderName))
        },
        {
            title: 'Length',
            dataIndex: 'length',
            key: 'length',
            render: (length) => colouredCell(timeFormatter(length), numbersToAnswerRelative(answerData?.length, length))
        },
        {
            title: 'Views',
            dataIndex: 'views',
            key: 'views',
            render: (views) => colouredCell(countFormatter(views), numbersToAnswerRelative(answerData?.views, views))
        },
        {
            title: 'Likes',
            dataIndex: 'likes',
            key: 'likes',
            render: (likes) => colouredCell(countFormatter(likes), numbersToAnswerRelative(answerData?.likes, likes))
        },
        {
            title: 'Comments',
            dataIndex: 'commentCount',
            key: 'commentCount',
            render: (comments) => colouredCell(countFormatter(comments), numbersToAnswerRelative(answerData?.commentCount, comments))
        },
        {
            title: 'Uploaded',
            dataIndex: 'uploadDate',
            key: 'uploadDate',
            render: (uploadDate) => colouredCell(dateFormatter(uploadDate), dateToAnswerRelative(answerData?.uploadDate, uploadDate))
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
            render: (categories) => colouredCell(tagsFormatter(categories, TagDescDictionary), tagsToAnswerRelative(answerData?.categories, categories))
        }
    ];
    return <ConfigProvider renderEmpty={() => <Empty image={<SearchOutlined />} description="Enter a guess in the search to start!" />}>
        <Table className='guess-table' rowKey={'key'} dataSource={data} columns={columns} pagination={false}>
        </Table>
    </ConfigProvider>;
}
