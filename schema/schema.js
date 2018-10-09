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
console.log(`users length: ${users.length}`);
let certs = require('./test-data/cert_register');
console.log(`certifications length: ${certs.length}`)


const UserType = new GraphQLObjectType({
    name: 'User',
    fields:() => ( {
        Id: { type: GraphQLInt },
        FIRST_NAME: { type: GraphQLString },
        CHAPTER: { type: GraphQLString },
        cert_registers: {
            type: new GraphQLList(Cert_RegisterType),
            resolve(parent, args){
                return _.filter(certs, {STUDENT_ID: parent.Id})
            }
        }
    })});



const Cert_RegisterType = new GraphQLObjectType({
        name: 'cert_register',
        fields: () => ({
            SEQN: {type: GraphQLInt},
            STUDENT_ID: {type: GraphQLInt},
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
            args: { id: { type: GraphQLInt } },
            resolve( parentValue, args ) {
                return _.find(users, { Id: args.id });
            }
        },

        cert: {
            type: Cert_RegisterType,
            args: {SEQN: {type: GraphQLInt}},
            resolve(parent, args){
                return _.find(certs, {SEQN: args.SEQN})
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery
});