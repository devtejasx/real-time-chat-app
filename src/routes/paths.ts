/** Application route paths — single source of truth for navigation. */
export const paths = {
  dashboard: "/",
  collections: "/collections",
  collectionDetail: (id = ":id") => `/collections/${id}`,
  execution: "/execution",
  executions: "/executions",
  executionDetail: (id = ":id") => `/executions/${id}`,
  reports: "/reports",
  reportDetail: (id = ":id") => `/reports/${id}`,
  cicd: "/cicd",
  docker: "/docker",
  settings: "/settings",
} as const;
