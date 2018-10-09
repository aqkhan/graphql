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

//
//
//

const UserCertType = new GraphQLObjectType({
    name: 'UserCert',
    fields:() => ( {
        Id: { type: GraphQLInt },
        FIRST_NAME: { type: GraphQLString },
        CHAPTER: { type: GraphQLString },
        cert_registers: {
            type: new GraphQLList(CertUserType),
            resolve(parent, args){
                return _.filter(certs, {STUDENT_ID: parent.Id})
            }
        }
    })});
const CertUserType = new GraphQLObjectType({
        name: 'CertUser',
        fields: () => ({
            SEQN: {type: GraphQLInt},
            STUDENT_ID: {type: GraphQLInt},
            user: {
                type: UserCertType,
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
        },
        userCert: {
            type: UserCertType,
            args: { id: { type: GraphQLInt } },
            resolve( parentValue, args ) {
                return _.find(users, { Id: args.id });
            }
        },
        certUser: {
            type: CertUserType,
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