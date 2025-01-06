import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import bodyParser from "body-parser"
import { expressMiddleware } from '@apollo/server/express4' 
import { PubSub } from 'graphql-subscriptions';



const pubSub = new PubSub()

const typeDefs = `
    type Comment {
        name: String!
        endDate: String!
    }

    type Query {
        sayHello: String!
    }

    type Mutation {
        createComment(name: String!): String!
    }

    type Subscription {
        commentAdded: Comment!
    }
`

const resolvers = {
    Query: {
        sayHello: () => 'Hello World'
    },
    Subscription: {
        commentAdded: {
            subscribe: () => pubSub.asyncIterableIterator(['COMMENT_ADDED'])
        }
    },
    Mutation: {
        createComment: (_, { name }) => {
            //TODO: Create comment
            pubSub.publish('COMMENT_ADDED', { commentAdded: { name, endDate: new Date().toISOString() } })

            return `Comment: ${name} created`
        }
    }

}



const schema = makeExecutableSchema({ typeDefs, resolvers })


const PORT = 4000
const app = express();

const httpServer = createServer(app);
const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
})

const wsServerCleanUp = useServer({schema} , wsServer)

const apolloServer = new ApolloServer({ 
    schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await wsServerCleanUp.dispose()
                    }
                }
            }
        }

    ]  

})

await apolloServer.start();

app.use('/graphql', bodyParser.json(), expressMiddleware(apolloServer))

httpServer.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
})