import { Challenge } from "../models/index.ts";
declare function index(owner: string): Promise<Challenge[]>;
declare function get(id: string, owner: string): Promise<Challenge | undefined>;
declare function create(json: Challenge): Promise<Challenge>;
declare function update(id: string, challenge: Challenge): Promise<Challenge>;
declare function remove(id: string, owner: string): Promise<void>;
declare const _default: {
    index: typeof index;
    get: typeof get;
    create: typeof create;
    update: typeof update;
    remove: typeof remove;
};
export default _default;
