/**
 * GraphQL — mutations with @glubean/graphql.
 *
 * Demonstrates:
 *   1. Create mutation
 *   2. Update mutation
 *   3. Delete mutation
 *
 * GraphQLZero mutations are simulated — data is not persisted,
 * but the API returns correct response shapes.
 *
 * Run:
 *   npx glubean run tests/graphql/mutations.test.ts
 */
import { test } from "@glubean/sdk";
import { gql } from "./config.ts";

// ---------------------------------------------------------------------------
// 1. Create — add a new post
// ---------------------------------------------------------------------------

export const createPost = test(
  { id: "gql-create-post", name: "GraphQL create post", tags: ["smoke", "graphql"] },
  async ({ expect, log }) => {
    const { data, errors } = await gql.mutate<{
      createPost: { id: string; title: string; body: string };
    }>(`
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          id
          title
          body
        }
      }
    `, {
      variables: {
        input: { title: "Glubean Test Post", body: "Created by @glubean/graphql" },
      },
    });

    expect(errors).toBeUndefined();
    expect(data!.createPost.id).toBeDefined();
    expect(data!.createPost.title).toBe("Glubean Test Post");
    log(`Created post #${data!.createPost.id}: ${data!.createPost.title}`);
  },
);

// ---------------------------------------------------------------------------
// 2. Update — modify an existing post
// ---------------------------------------------------------------------------

export const updatePost = test(
  { id: "gql-update-post", name: "GraphQL update post", tags: ["graphql"] },
  async ({ expect, log }) => {
    const { data, errors } = await gql.mutate<{
      updatePost: { id: string; title: string };
    }>(`
      mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
        updatePost(id: $id, input: $input) {
          id
          title
        }
      }
    `, {
      variables: {
        id: "1",
        input: { title: "Updated by Glubean" },
      },
    });

    expect(errors).toBeUndefined();
    expect(data!.updatePost.id).toBe("1");
    expect(data!.updatePost.title).toBe("Updated by Glubean");
    log(`Updated post #${data!.updatePost.id} → "${data!.updatePost.title}"`);
  },
);

// ---------------------------------------------------------------------------
// 3. Delete — remove a post
// ---------------------------------------------------------------------------

export const deletePost = test(
  { id: "gql-delete-post", name: "GraphQL delete post", tags: ["graphql"] },
  async ({ expect, log }) => {
    const { data, errors } = await gql.mutate<{
      deletePost: boolean;
    }>(`
      mutation DeletePost($id: ID!) {
        deletePost(id: $id)
      }
    `, { variables: { id: "101" } });

    expect(errors).toBeUndefined();
    expect(data!.deletePost).toBe(true);
    log("Post 101 deleted");
  },
);
