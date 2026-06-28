import "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { MUTATION_KEYS, QUERY_KEYS } from "./reactQueryKeys";

export type QueryKeys = (typeof QUERY_KEYS)[keyof typeof QUERY_KEYS];
export type QueryKey = [QueryKeys, ...ReadonlyArray<unknown>];

export type MutationKeys = (typeof MUTATION_KEYS)[keyof typeof MUTATION_KEYS];
export type MutationKey = [MutationKeys, ...ReadonlyArray<unknown>];

export type BaseQueryOptions<TData, TError, TQueryFnData, TQueryKey extends QueryKey> = Omit<
  UseQueryOptions<TData, TError, TQueryFnData, TQueryKey>,
  "queryKey"
> & {
  queryKey?: TQueryKey;
};

declare module "@tanstack/react-query" {
  interface Register {
    queryKey: QueryKey;
    mutationKey: MutationKey;
  }
}
