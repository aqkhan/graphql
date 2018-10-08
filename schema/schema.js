const graphql = require('graphql');
let fs = require('fs');
let fastcsv = require('fast-csv');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLList,
} = graphql;

// To walk through data
const _ = require('lodash');


// Fast CSV implementation

let readableStreamInput = fs.createReadStream('./schema/test-data/Name.csv');
let users = [];

fastcsv
    .fromStream(readableStreamInput, {headers: true})
    .on('data', (data) => {
        let rowData = {};

        Object.keys(data).forEach(current_key => {
            rowData[current_key] = data[current_key]
        });

        users.push(rowData);

    }).on('end', () => {
    console.log('total rows of table', users.length);
});

let readableStreamInput2 = fs.createReadStream('./schema/test-data/cert_register.csv');
let certs = [];

fastcsv
    .fromStream(readableStreamInput2, {headers: true})
    .on('data', (data) => {
        let rowData = {};

        Object.keys(data).forEach(current_key => {
            rowData[current_key] = data[current_key]
        });

        certs.push(rowData);

    }).on('end', () => {
    console.log('total rows of table certs', certs.length);
});


const UserType = new GraphQLObjectType({
    name: 'User',
    fields:() => ( {
        Id: { type: GraphQLString },
        FIRST_NAME: { type: GraphQLString },
        CHAPTER: { type: GraphQLString },
        cert_registers: {
            type: new GraphQLList(Cert_RegisterType),
            resolve(parent, args){
                return _.filter(certs, {STUDENT_ID: parent.Id})
            }
        }
    })});

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: {
        CO_ID: { type: GraphQLString },
        COMPANY_SORT: { type: GraphQLString },
        Id: { type: GraphQLString },
    }
});

const Cert_RegisterType = new GraphQLObjectType({
        name: 'cert_register',
        fields: () => ({
            SEQN: {type: GraphQLString},
            STUDENT_ID: {type: GraphQLString},
            user: {
                type: UserType,
                resolve(parent, args){
                    return _.find(users, {Id: parent.STUDENT_ID})
                }
            }
        })
    }
)

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
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
        certs: {
            type: new GraphQLList(Cert_RegisterType),
            resolve() {
                return certs;
            }
        },
        cert: {
            type: Cert_RegisterType,
            args: {SEQN: {type: GraphQLString}},
            resolve(parent, args){
                return _.find(certs, {SEQN: args.SEQN})
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