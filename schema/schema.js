const graphql = require('graphql');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLInt,
    GraphQLList
} = graphql;

// To walk through data
const _ = require('lodash');

let users = require('./test-data/name_full');

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        Id: { type: GraphQLInt },
        FIRST_NAME: { type: GraphQLString },
        CHAPTER: { type: GraphQLString }
    }
});

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: {
        CO_ID: { type: GraphQLString },
        COMPANY_SORT: { type: GraphQLString },
        Id: { type: GraphQLString },
    }
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLInt } },
            resolve( parentValue, args ) {
                return _.find(users, { Id: args.id });
            }
        },
        users: {
            type: new GraphQLList(UserType),
            resolve() {
                return users;
            }
        },
        company: {
            type: CompanyType,
            args: { companyId: { type: GraphQLString } },
            resolve( parentValue, args ) {
                return _.find( users, { CO_ID: args.companyId } )
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery
});