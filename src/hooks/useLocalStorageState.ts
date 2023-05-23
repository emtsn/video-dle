import { useEffect } from 'react';
import { Dispatch, SetStateAction, useState } from 'react';

export function useLocalStorageState<T>(
    key: string,
    init: T,
    validator?: (val: any) => boolean,
    inputConverter: (inputVal: T) => string = JSON.stringify,
    outputConverter: (storedVal: string) => T = JSON.parse
): [T, Dispatch<SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        const lsItem: string | null = localStorage.getItem(key);
        if (lsItem != null) {
            const storedVal = outputConverter(lsItem);
            if (validator == null || validator(storedVal)) {
                init = storedVal as T;
            }
        }
        localStorage.setItem(key, inputConverter(init));
        return init;
    });
    useEffect(() => {
        localStorage.setItem(key, inputConverter(state));
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
        (inputVal: T[]) => JSON.stringify(inputVal),
        (outputVal: string) => JSON.parse(outputVal)
    );
}
