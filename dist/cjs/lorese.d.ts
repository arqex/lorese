declare type ReducerInput<ST, ARG> = (store: ST, arg: ARG) => ST;
declare type ReducerOutput<ARG> = (arg: ARG) => void;
declare type SelectorInput<ST, ARG, RET> = (store: ST, arg: ARG) => RET;
declare type SelectorOutput<ARG, RET> = (arg: ARG) => RET;
interface LoaderInput<ST, INP> {
    selector: (store: ST, arg: INP) => any;
    load: (arg: INP, store: ST) => Promise<any>;
    isValid?: (arg: INP) => boolean;
}
interface LoaderOutput<INP, RET> {
    isLoading: boolean;
    data: RET | undefined;
    error: any;
    retry: (arg: INP) => void;
    promise: Promise<any>;
}
declare type LoaderFunction<ARG, RET> = (input: ARG) => LoaderOutput<ARG, RET>;
export interface Lorese<ST> {
    addChangeListener(clbk: () => any): void;
    removeChangeListener(clbk: () => any): void;
    emitStateChange(): void;
    loader<INP, RET>(config: LoaderInput<ST, INP>): LoaderFunction<INP, RET>;
    reducer<ARG>(clbk: ReducerInput<ST, ARG>): ReducerOutput<ARG>;
    selector<ARG, RET>(clbk: SelectorInput<ST, ARG, RET>): SelectorOutput<ARG, RET>;
}
export default function lorese<ST>(store: ST): Lorese<ST>;
export {};
