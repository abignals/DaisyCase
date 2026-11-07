import { useCallback, useEffect, useState } from "react";

export type AsyncState<T> = | { status: 'loading' } | { status: 'error'; error: unknown } | { status: 'success'; data: T };

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
    const [state, setState] = useState<AsyncState<T>> ({ status: 'loading' });

    const run = useCallback(() => {
        let cancelled = false;
        setState({ status: 'loading'});
        fn()
            .then((data) => !cancelled && setState({ status: 'success', data }))
            .catch((error) => !cancelled && setState({ status: 'error', error}));
        return () => { cancelled = true };
    }, deps);

    useEffect(run, [run]);
    return { state, retry: run };
}