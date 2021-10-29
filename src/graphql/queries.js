/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getProject = /* GraphQL */ `
  query GetProject($id: ID!) {
    getProject(id: $id) {
      id
      name
      description
      filePath
      owner
      states {
        items {
          id
          title
          description
          projectID
          createdAt
          updatedAt
        }
        nextToken
      }
      filters {
        items {
          id
          name
          min
          max
          projectID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const listProjects = /* GraphQL */ `
  query ListProjects(
    $filter: ModelProjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProjects(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        filePath
        owner
        states {
          nextToken
        }
        filters {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getState = /* GraphQL */ `
  query GetState($id: ID!) {
    getState(id: $id) {
      id
      title
      description
      projectID
      project {
        id
        name
        description
        filePath
        owner
        states {
          nextToken
        }
        filters {
          nextToken
        }
        createdAt
        updatedAt
      }
      comments {
        items {
          id
          author
          stateID
          content
          createdAt
          updatedAt
        }
        nextToken
      }
      filters {
        items {
          id
          stateID
          filterID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const listStates = /* GraphQL */ `
  query ListStates(
    $filter: ModelStateFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listStates(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        description
        projectID
        project {
          id
          name
          description
          filePath
          owner
          createdAt
          updatedAt
        }
        comments {
          nextToken
        }
        filters {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getFilter = /* GraphQL */ `
  query GetFilter($id: ID!) {
    getFilter(id: $id) {
      id
      name
      min
      max
      projectID
      project {
        id
        name
        description
        filePath
        owner
        states {
          nextToken
        }
        filters {
          nextToken
        }
        createdAt
        updatedAt
      }
      states {
        items {
          id
          stateID
          filterID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const listFilters = /* GraphQL */ `
  query ListFilters(
    $filter: ModelFilterFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFilters(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        min
        max
        projectID
        project {
          id
          name
          description
          filePath
          owner
          createdAt
          updatedAt
        }
        states {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getComment = /* GraphQL */ `
  query GetComment($id: ID!) {
    getComment(id: $id) {
      id
      author
      stateID
      state {
        id
        title
        description
        projectID
        project {
          id
          name
          description
          filePath
          owner
          createdAt
          updatedAt
        }
        comments {
          nextToken
        }
        filters {
          nextToken
        }
        createdAt
        updatedAt
      }
      content
      createdAt
      updatedAt
    }
  }
`;
export const listComments = /* GraphQL */ `
  query ListComments(
    $filter: ModelCommentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listComments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        author
        stateID
        state {
          id
          title
          description
          projectID
          createdAt
          updatedAt
        }
        content
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
