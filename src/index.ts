import { fetchData, fetchUser } from './services/fetch.service.js'
import config from './config/api.config.js'
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { User } from './models/user.model';
import { randomInt } from 'crypto';
import { GraphQLError } from 'graphql';



// Origen de datos
const data = await fetchData(config.api.url)
const users = await fetchUser()

// Definición de tipos

const typeDefs = `
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
        name: String!
        surname: String!
        street: String!
        zipCode: Int!
        city: String!
        phone: String
        address: String
    }

    type Query {
        products: [Product]
        product(id:ID!): Product
        users: [User]
        userCount: Int!
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
            phone: String
        ): User
    }
` 



// Solucionadores

const resolvers = {
    User: {
        address: (parent: any) => `${parent.street}, ${parent.zipCode}, ${parent.city}`
    },
    Query: {
        products: () => data,
        product: (_:any, args:{ id: string }) => data.find((product: any) => product.id === parseInt(args.id)),
        users: () => users,
        userCount: () => users.length,
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

// Mutaciones

// Suscripciones



//Servidor

const server = new ApolloServer({
    typeDefs,
    resolvers
})


const { url } = await startStandaloneServer(server, {listen: {port: 4000}})




console.log(`Server ready at ${url}`)


