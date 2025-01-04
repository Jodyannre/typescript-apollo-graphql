export const typeDefs = `
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