"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphqlfields = require("graphql-fields");
const lodash_1 = require("lodash");
class RequestedFields {
    getFields(info, options) {
        let fields = Object.keys(graphqlfields(info));
        if (!options)
            return fields;
        fields = (options.keep) ? lodash_1.union(fields, options.keep) : fields;
        fields = (options.exclude) ? lodash_1.difference(fields, options.exclude) : fields;
        return fields;
    }
}
exports.RequestedFields = RequestedFields;
