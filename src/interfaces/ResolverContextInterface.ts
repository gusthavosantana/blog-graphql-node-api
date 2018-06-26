import { DBConnection } from "./DBConnectionInterface";
import { AuthUser } from "./AuthUserInterface";
import { DataLoaders } from "./DataLoadersInterface";
import { RequestedFields } from "../graphql/ast/RequestedFields";

export interface ResolverContext {

    db?: DBConnection;
    authorization?: string;
    authUser: AuthUser;
    dataloaders?: DataLoaders;
    requestedFields?: RequestedFields;
}