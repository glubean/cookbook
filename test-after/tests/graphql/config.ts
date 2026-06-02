/**
 * Shared GraphQL client for GraphQLZero (free, no auth).
 *
 * GraphQLZero provides a fake online GraphQL API backed by JSONPlaceholder data.
 * Supports queries, mutations, pagination — perfect for testing patterns.
 */
import { configure } from "@glubean/sdk";
import { graphql } from "@glubean/graphql";

export const { gql } = configure({
  plugins: {
    gql: graphql({
      endpoint: "https://graphqlzero.almansi.me/api",
    }),
  },
});
