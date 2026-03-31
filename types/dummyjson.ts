/**
 * Types for DummyJSON data-driven test data.
 *
 * Reusable across explore/ and tests/.
 * Use `type` (not `interface`) — data loaders require index signatures.
 */

/** Row shape for data/dummyjson/catalog.csv */
export type CatalogRow = {
  id: string;
  label: string;
  minPrice: string;
  category: string;
};

/** Row shape for data/dummyjson/catalog.yaml */
export type CatalogCase = {
  id: number;
  label: string;
  minPrice: number;
  category: string;
};

/** Row shape for data/search-queries-yaml/shared.yaml */
export type SearchCase = {
  description: string;
  query: { q: string };
  expect: { minResults: number };
};

/** Row shape for data/search-queries/*.json (fromDir.merge) */
export type SearchQuery = {
  q: string;
  minResults: number;
};
