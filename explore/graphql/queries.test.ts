/**
 * GraphQL — queries with @glubean/graphql.
 *
 * Demonstrates:
 *   1. Simple query
 *   2. Query with variables
 *   3. Pagination
 *   4. Nested relationships
 *
 * Uses GraphQLZero (free, no auth): https://graphqlzero.almansi.me
 *
 * Run:
 *   npx glubean run explore/graphql/queries.test.ts
 */
import { test } from "@glubean/sdk";
import { gql } from "./config.ts";

// ---------------------------------------------------------------------------
// 1. Simple query — list posts
// ---------------------------------------------------------------------------

export const listPosts = test(
  { id: "gql-list-posts", name: "GraphQL list posts", tags: ["smoke", "graphql"] },
  async ({ expect, log }) => {
    const { data, errors } = await gql.query<{
      posts: { data: Array<{ id: string; title: string }> };
    }>(`
      query ListPosts {
        posts(options: { paginate: { page: 1, limit: 3 } }) {
          data { id title }
        }
      }
    `);

    expect(errors).toBeUndefined();
    expect(data!.posts.data).toHaveLength(3);
    log(`Got ${data!.posts.data.length} posts`);
    for (const post of data!.posts.data) {
      log(`  [${post.id}] ${post.title.slice(0, 50)}`);
    }
  },
);

// ---------------------------------------------------------------------------
// 2. Query with variables — get single post
// ---------------------------------------------------------------------------

export const getPost = test(
  { id: "gql-get-post", name: "GraphQL get post by ID", tags: ["smoke", "graphql"] },
  async ({ expect, log }) => {
    const { data, errors } = await gql.query<{
      post: { id: string; title: string; body: string };
    }>(`
      query GetPost($id: ID!) {
        post(id: $id) {
          id
          title
          body
        }
      }
    `, { variables: { id: "1" } });

    expect(errors).toBeUndefined();
    expect(data!.post.id).toBe("1");
    expect(data!.post.title).toBeDefined();
    log(`Post 1: ${data!.post.title.slice(0, 60)}`);
  },
);

// ---------------------------------------------------------------------------
// 3. Pagination — compare two pages
// ---------------------------------------------------------------------------

export const pagination = test(
  { id: "gql-pagination", name: "GraphQL pagination", tags: ["graphql"] },
  async ({ expect, log }) => {
    const page1 = await gql.query<{
      posts: {
        data: Array<{ id: string }>;
        meta: { totalCount: number };
      };
    }>(`
      query Page($page: Int!, $limit: Int!) {
        posts(options: { paginate: { page: $page, limit: $limit } }) {
          data { id }
          meta { totalCount }
        }
      }
    `, { variables: { page: 1, limit: 5 } });

    const page2 = await gql.query<{
      posts: { data: Array<{ id: string }> };
    }>(`
      query Page($page: Int!, $limit: Int!) {
        posts(options: { paginate: { page: $page, limit: $limit } }) {
          data { id }
        }
      }
    `, { variables: { page: 2, limit: 5 } });

    expect(page1.data!.posts.data).toHaveLength(5);
    expect(page2.data!.posts.data).toHaveLength(5);

    const ids1 = page1.data!.posts.data.map((p) => p.id);
    const ids2 = page2.data!.posts.data.map((p) => p.id);
    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap).toHaveLength(0);

    log(`Total: ${page1.data!.posts.meta.totalCount}`);
    log(`Page 1 IDs: ${ids1.join(", ")}`);
    log(`Page 2 IDs: ${ids2.join(", ")}`);
  },
);

// ---------------------------------------------------------------------------
// 4. Nested relationships — user with posts
// ---------------------------------------------------------------------------

export const nestedQuery = test(
  { id: "gql-nested", name: "GraphQL nested user + posts", tags: ["graphql"] },
  async ({ expect, log }) => {
    const { data, errors } = await gql.query<{
      user: {
        id: string;
        name: string;
        email: string;
        posts: { data: Array<{ id: string; title: string }> };
      };
    }>(`
      query UserWithPosts($userId: ID!) {
        user(id: $userId) {
          id
          name
          email
          posts(options: { paginate: { limit: 3 } }) {
            data { id title }
          }
        }
      }
    `, { variables: { userId: "1" } });

    expect(errors).toBeUndefined();
    expect(data!.user.name).toBeDefined();
    expect(data!.user.posts.data.length).toBeGreaterThan(0);
    log(`User: ${data!.user.name} (${data!.user.email})`);
    log(`Posts: ${data!.user.posts.data.length}`);
  },
);
