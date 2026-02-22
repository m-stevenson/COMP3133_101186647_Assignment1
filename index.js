import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import employeeSchema from "./schemas/schema.js";
import resolvers from "./resolvers/resolvers.js";
import mongoose from "mongoose";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

const app = express();

dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Missing mongo URI connection variable");
  await mongoose.connect(uri);
};

async function startServer() {
  await connectDB();
  console.log("Connected to MongoDB");

  const server = new ApolloServer({
    typeDefs: employeeSchema,
    resolvers: resolvers,
  });

  //Start the Apollo Server
  await server.start();

  //Apply middleware to the Express app
  app.use("/graphql", cors(), express.json(), expressMiddleware(server));

  //Start Express server
  app.listen(process.env.PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${process.env.PORT}/graphql`,
    );
  });
}

startServer().catch((err) => {
  console.error("Server failed to start", err.message);
});
