import { Challenge } from "../models/index.ts";
declare function index(): Promise<Challenge[]>;
declare function get(id: string): Promise<Challenge | undefined>;
declare const _default: {
    index: typeof index;
    get: typeof get;
};
export default _default;
