const graphql = require('graphql');
var mysql      = require('mysql');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLInt,
    GraphQLList
} = graphql;

// To walk through data
const _ = require('lodash');



// my sql connection
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'scte_dashboard'
});

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});
var users=[];
var certs=[];
const getUsers = new Promise((resolve,reject)=>{
    connection.query('SELECT * FROM name', function (error, results, fields) {
        if (error) {
            console.log(error);
        }
        console.log('users length: ', results.length);
        resolve(results);
    });
});


const getCerts = new Promise((resolve,reject)=>{
    connection.query('SELECT * FROM cert_register', function (error, results, fields) {
        if (error) {
            console.log(error);
        }
        console.log('certss length: ', results.length);
        resolve(results);
    });
})

const disconnectDb=()=>{
    return new Promise((resolve,reject)=>{
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