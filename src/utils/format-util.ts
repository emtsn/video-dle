const NUM_BILLION = 1000000000 as const;
const NUM_MILLION = 1000000 as const;
const NUM_THOUSAND = 1000 as const;

/**
 * Format a 'count' number as '?B', '?M', or '?K' string
 * @param count
 * @returns
 */
export function countFormatter(count: number | undefined): string {
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
export function timeFormatter(timeSeconds: number): string {
    const hours = Math.floor(timeSeconds / 3600);
    const minutes = Math.floor((timeSeconds % 3600) / 60);
    const seconds = (timeSeconds % 3600) % 60;
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
