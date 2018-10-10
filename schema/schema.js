const graphql = require('graphql');
const mongoose = require('mongoose');
const users = require('../model/user');
const certs =require('../model/certification');
const v8 = require('v8');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLInt,
    GraphQLList
} = graphql;

// To walk through data
const _ = require('lodash');

console.log(v8.getHeapStatistics());

// my mongodb connection

mongoose.Promise = global.Promise;

    mongoose.connect('mongodb://localhost/scte-dashboard');

    mongoose.connection.once('open',()=>{
        console.log("successfully connected")
    }).on('err',(err)=>{
        console.log(err);
    });




const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        Id: { type: GraphQLInt },
        FIRST_NAME: { type: GraphQLString },
        CHAPTER: { type: GraphQLString }
    }
});

// const CompanyType = new GraphQLObjectType({
//     name: 'Company',
//     fields: {
//         CO_ID: { type: GraphQLString },
//         COMPANY_SORT: { type: GraphQLString },
//         Id: { type: GraphQLString },
//     }
// });

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
                return certs.findById(parent.Id)
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
                    return users.find({Id: parent.STUDENT_ID})
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
                return users.find({Id:args.id});
            }
        },
        users: {
            type: new GraphQLList(UserType),
            resolve() {
                return users.find({}).limit(10);
            }
        },
        // company: {
        //     type: CompanyType,
        //     args: { companyId: { type: GraphQLString } },
        //     resolve( parentValue, args ) {
        //         return _.find( users, { CO_ID: args.companyId } )
        //     }
        // },
        userCert: {
            type: UserCertType,
            args: { id: { type: GraphQLInt } },
            resolve( parentValue, args ) {
                return users.find({ Id: args.id });
            }
        },
        certUser: {
            type: CertUserType,
            args: {SEQN: {type: GraphQLInt}},
            resolve(parent, args){
                return certs.find({SEQN: args.SEQN})
            }
        }
    }


});

module.exports = new GraphQLSchema({
    query: RootQuery
});