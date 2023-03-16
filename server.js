const { ApolloServer } = require('apollo-server-express');
const fetch = require('node-fetch');
const express = require('express');
require('dotenv').config();

// DATABASE (mocked)

const database = {
  collection: [
    { id: 1, data: 'document 1' },
    { id: 2, data: 'document 2' },
    { id: 3, data: 'document 3' },
    { id: 4, data: 'document 4' },
  ]
};

// API ENDPOINTS (mocked)

const getPosts = new Promise((resolve, reject) => {
  const data = database.collection;

  try {
    setTimeout(() => resolve(data), 2000);
  } catch (e) {
    reject(e);
  }
});

const getPostCount = new Promise((resolve, reject) => {
  const data = database.collection.length;

  try {
    setTimeout(() => resolve(data), 2000);
  } catch (e) {
    reject(e);
  }
});

// GQL SERVER

const typeDefs = `
  type Post {
    id: Int,
    data: String
  }

  type Query {
    count: Int!,
    posts: [Post]
  }
`;

const resolvers = {
  Query: {
    count: async () => getPostCount,
    posts: async () => getPosts
  },
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

const queryPostCount = { query: '{ count }' };
const queryPosts = { query: 'query { posts { data } }' };

// EXPRESS SERVER
const app = express();

apolloServer.start()
  .then(() => apolloServer.applyMiddleware({ app }));

app.get('/rest', (req, res) => {
  fetch('http://localhost:3000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(queryPosts)
  })
  .then(x => x.json())
  .then(x => x.data)
  .then(y => res.status(200).json(y))
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
