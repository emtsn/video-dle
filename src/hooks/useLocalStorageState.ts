import { useEffect } from 'react';
import { Dispatch, SetStateAction, useState } from 'react';

/**
 * Insert input into localStorage iff it is not undefined
 * @param key
 * @param input
 */
function insertIfDefined(key: string, input: string | undefined): void {
    if (input !== undefined) {
        localStorage.setItem(key, input);
    } else {
        localStorage.removeItem(key);
    }
}

export function useLocalStorageState<T>(
    key: string,
    init: T,
    validator?: (val: any) => boolean,
    inputConverter: (inputVal: T) => string | undefined = JSON.stringify,
    outputConverter: (storedVal: string) => T = JSON.parse
): [T, Dispatch<SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        const lsItem: string | null = localStorage.getItem(key);
        if (lsItem != null) {
            let storedVal = undefined;
            try {
                storedVal = outputConverter(lsItem);
            } catch (error) {
                console.error(error);
            }
            if (storedVal !== undefined && (validator == null || validator(storedVal))) {
                init = storedVal as T;
            }
        }
        insertIfDefined(key, inputConverter(init));
        return init;
    });

    useEffect(() => {
        insertIfDefined(key, inputConverter(state));
    }, [key, state, inputConverter]);

    return [state, setState];
}

export function useLocalStorageStateNumber(
    key: string,
    init: number,
    validator?: (val: any) => boolean
): [number, Dispatch<SetStateAction<number>>] {
    return useLocalStorageState<number>(
        key,
        init,
        (val: any) => !isNaN(val) && (validator == null || validator(val)),
        (inputVal: number) => inputVal.toString(),
        (outputVal: string) => Number(outputVal)
    );
}

export function useLocalStorageStateArray<T>(
    key: string,
    init: Array<T>,
    elementValidator: (val: any) => boolean
): [Array<T>, Dispatch<SetStateAction<Array<T>>>] {
    return useLocalStorageState<Array<T>>(
        key,
        init,
        (val: any) => Array.isArray(val) && val.every((x) => elementValidator(x)),
        (inputVal: T[]) => (inputVal.length < 1 ? undefined : JSON.stringify(inputVal)),
        (outputVal: string) => JSON.parse(outputVal)
    );
}
