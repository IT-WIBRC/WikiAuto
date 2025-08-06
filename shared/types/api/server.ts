import type { ApiResponseResult } from "./common";
import type { DBSession, DBUser } from "../data-access";

export type LoginPayloadData = {
    user: DBUser | null;
    session: DBSession | null;
};

export type LoginResponse = ApiResponseResult<LoginPayloadData>;
export type LogoutResponse = ApiResponseResult;
