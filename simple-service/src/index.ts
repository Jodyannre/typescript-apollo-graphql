import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { makeExecutableSchema } from '@graphql-tools/schema'
import { countryCodeDirectiveTransformer, upperCaseDirectiveTransformer } from './graphql/directives.js';
import { resolvers } from './graphql/resolvers.js';
import { typeDefs } from './graphql/typeDefs.js';

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
