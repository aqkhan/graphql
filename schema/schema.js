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

const connectDb = new Promise((resolve,reject)=>{
    connection.query('SELECT * FROM name', function (error, results, fields) {
        if (error) {
            console.log(error);
        }
        console.log('users length: ', results.length);
        resolve(results);
    });
})

const disconnectDb=()=>{
    return new Promise((resolve,reject)=>{
        resolve("connection end");
    });
}


async function connectAndDesconnectAW() {
    users = await connectDb;
    console.log("fetch completed");
    const disConnectResult= await disconnectDb();
    console.log(disConnectResult);

}
connectAndDesconnectAW();

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