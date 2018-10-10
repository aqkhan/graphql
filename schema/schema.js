const graphql = require('graphql');
const mongoose = require('mongoose');
const user = require('../model/user');
const cert =require('../model/certification');
const v8 = require('v8')
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLInt,
    GraphQLList
} = graphql;

// total heap size
console.log(v8.getHeapStatistics());


// To walk through data
const _ = require('lodash');



// my mongodb connection

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/scte-dashboard');

mongoose.connection.once('open',()=>{
    console.log("successfully connected")
}).on('err',(err)=>{
    console.log(err);
});
let users=[];
let certs=[];
const getUsers = new Promise((resolve,reject)=>{

    console.log('users length: ', user.find().length);
    resolve(user.find());
});


const getCerts = new Promise((resolve,reject)=>{
    console.log('certss length: ', cert.find().length);
    resolve(cert.find());
});

const disconnectDb=()=>{
    return new Promise((resolve,reject)=>{
        mongoose.connection.close()
        resolve("connection end");
    });
}


async function connectAndDesconnectAW() {
    users = await getUsers;
    console.log("Users fetch completed");
    certs = await getCerts;
    console.log("Certs fetch completed");
    const disConnectResult= await disconnectDb();
    console.log(disConnectResult);

}
connectAndDesconnectAW();




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