import { fetchData, fetchUser } from './services/fetch.service.js'
import config from './config/api.config.js'
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { User } from './models/user.model';
import { randomInt } from 'crypto';
import { GraphQLError } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema'
import { countryCodeDirectiveTransformer, upperCaseDirectiveTransformer } from './directives/directives.js';



/*
    Directivas built-in

@deprecated(reason:String)
@skip(if:Boolean)
@include(if:Boolean)

*/


// Origen de datos
const data = await fetchData(config.api.url)
const users = await fetchUser()

// Definición de tipos
const typeDefs = `
    # Definition of directives
    directive @uppercase on FIELD_DEFINITION
    directive @countryCode on FIELD_DEFINITION

    type Rating {
        rate: Int
        count: Int
    }

    type Product {
        id: ID!
        title: String
        price: Float
        description: String
        category: String
        image: String
        rating: Rating
    }

    type User {
        id: ID!
        name: String! @uppercase
        surname: String!
        street: String
        zipCode: Int!
        city: String!
        phone: String @countryCode
        address: String
        fullName: String 
    }

    type Query {
        products: [Product]
        product(id:ID!): Product
        users: [User]
        userCount: Int! @deprecated(reason: "Use usersLength instead")
        userLength: Int!
        findUserByName(name: String!): User
        findUserById(id: ID!): User
    }

    type Mutation {
        addUser(
            name: String!, 
            surname: String!, 
            street: String!, 
            zipCode: Int!, 
            city: String!, 
            phone: String!
        ): User
    }
` 

// Solucionadores

const resolvers = {
    User: {
        address: (parent: any) => `${parent.street}, ${parent.zipCode}, ${parent.city}`,
        fullName: (parent: any) => `${parent.name} ${parent.surname}`,
    },
    Query: {
        products: () => data,
        product: (_:any, args:{ id: string }) => data.find((product: any) => product.id === parseInt(args.id)),
        users: () => users,
        userCount: () => users.length,
        userLength: () => users.length,
        findUserByName: (_:any, args:{ name: string }) => users.find((user: User) => user.name === args.name),
        findUserById: (_:any, args: { id: string}) => users.find((user: User) => user.id === parseInt(args.id))
    },
    Mutation: {
        addUser: (_:any, args:User) => {
            if (users.find((user: User) => user.name === args.name)) {
                throw new GraphQLError('User already exists', {
                    extensions: {
                        code: 'BAD_USER_INPUT'
                    }
                })
            }

            const newUser = {
                ...args, id: randomInt(1, 1000)
            }
            users.push(newUser)
            return newUser
        }
    }

}

// Schema
let schema = makeExecutableSchema({
    typeDefs,
    resolvers
})

// Add custom directives
schema = upperCaseDirectiveTransformer(schema, 'uppercase');
schema = countryCodeDirectiveTransformer(schema, 'countryCode');

const server = new ApolloServer({
    schema
})


const { url } = await startStandaloneServer(server, {listen: {port: 4000}})
console.log(`Server ready at ${url}`)
