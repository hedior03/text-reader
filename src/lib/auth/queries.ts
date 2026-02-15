import { queryOptions } from "@tanstack/react-query";
import { getUserFn } from "./functions";

export const authQueryOptions = () =>
  queryOptions({
    queryKey: ["user"],
    queryFn: () => getUserFn(),
  });

export type AuthQueryResult = Awaited<ReturnType<typeof getUserFn>>;
