import { fetchData } from './services/fetch.service.js'
import config from './config/api.config.js'
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';




// Origen de datos
const data = await fetchData(config.api.url)
// Definición de tipos

const typeDefs: string = `
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

    type Query {
        products: [Product]
        product(id:ID!): Product
    }
` 



// Solucionadores

const resolvers = {
    Query: {
        products: () => data,
        product: (_:any, args:any) => data.find((product: any) => product.id === parseInt(args.id))
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


