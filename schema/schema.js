const graphql = require('graphql');

// For fast CSV imports
// let fs = require('fs');
// let fastcsv = require('fast-csv');

// For calling Micro services via HTTP
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLList
} = graphql;

// To walk through static data
const _ = require('lodash');

// Dummy data

// const users = require('./test-data/users');
/*
const users = [
    {
        Id: '1',
        FIRST_NAME: 'A Q Khan',
        CHAPTER: 'i-Intellect Inc.'
    }
];
*/

// Fast CSV implementation

// let readableStreamInput = fs.createReadStream('./schema/test-data/Name.csv');
let users = [];

// fastcsv
//     .fromStream(readableStreamInput, {headers: true})
//     .on('data', (data) => {
//         let rowData = {};
//
//         Object.keys(data).forEach(current_key => {
//             rowData[current_key] = data[current_key]
//         });
//
//         users.push(rowData);
//
//     }).on('end', () => {
//     console.log('total rows of table', users.length);
// });

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: GraphQLString },
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
            args: { id: { type: GraphQLString } },
            resolve( parentValue, args ) {
                return axios.get(`http://localhost:3000/users/${args.id}`)
                    .then( response => response.data); // Since axios returns response with data key
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