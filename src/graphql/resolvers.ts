import { fetchData, fetchUser } from '../services/fetch.service.js'
import config from '../config/api.config.js'
import { User } from '../models/user.model';
import { randomInt } from 'crypto';
import { GraphQLError } from 'graphql';


// Origen de datos
const data = await fetchData(config.api.url)
const users = await fetchUser()


export const resolvers = {
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