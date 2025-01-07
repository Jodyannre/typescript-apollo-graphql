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
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import CommentModel from './models/Comment.model';
dotenv.config();


const MONGODB = `mongodb+srv://admin:${process.env.MONGO_PASS}@graphql-example.jjnxr.mongodb.net/?retryWrites=true&w=majority&appName=graphql-example`

const pubSub = new PubSub()

const typeDefs = `
    type Comment {
        name: String!
        endDate: String!
    }

    type Query {
        sayHello: String!
        getComment(id:ID!): Comment
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
        sayHello: () => 'Hello World',
        getComment: async (__dirname, { id }) => await CommentModel.findById(id)
    },
    Subscription: {
        commentAdded: {
            subscribe: () => pubSub.asyncIterableIterator(['COMMENT_ADDED'])
        }
    },
    Mutation: {
        createComment: async (_, { name }) => {
            //TODO: Create comment
            const endDate = new Date().toISOString()
            const newComment = new CommentModel({ name, endDate })
            const res = await newComment.save()

            if (!res.errors) {
                pubSub.publish('COMMENT_ADDED', { commentAdded: { name, endDate: new Date().toISOString() } })
                return `Comment: ${name} created`
            }
    
            return 'Error creating comment'
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

mongoose.set('strictQuery', false)
mongoose.connect(MONGODB)

httpServer.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
})