/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const syncProjects = /* GraphQL */ `
  query SyncProjects(
    $filter: ModelProjectFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncProjects(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        name
        description
        filePath
        properties
        author
        shared
        files
        states {
          nextToken
          startedAt
        }
        filters {
          nextToken
          startedAt
        }
        columns {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getProject = /* GraphQL */ `
  query GetProject($id: ID!) {
    getProject(id: $id) {
      id
      name
      description
      filePath
      properties
      author
      shared
      files
      states {
        items {
          id
          title
          description
          camera
          projectID
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        nextToken
        startedAt
      }
      filters {
        items {
          id
          name
          projectID
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        nextToken
        startedAt
      }
      columns {
        items {
          id
          name
          min
          max
          projectID
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        nextToken
        startedAt
      }
      _version
      _deleted
      _lastChangedAt
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
        properties
        author
        shared
        files
        states {
          nextToken
          startedAt
        }
        filters {
          nextToken
          startedAt
        }
        columns {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncStates = /* GraphQL */ `
  query SyncStates(
    $filter: ModelStateFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncStates(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        title
        description
        camera
        projectID
        project {
          id
          name
          description
          filePath
          properties
          author
          shared
          files
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        comments {
          nextToken
          startedAt
        }
        filters {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getState = /* GraphQL */ `
  query GetState($id: ID!) {
    getState(id: $id) {
      id
      title
      description
      camera
      projectID
      project {
        id
        name
        description
        filePath
        properties
        author
        shared
        files
        states {
          nextToken
          startedAt
        }
        filters {
          nextToken
          startedAt
        }
        columns {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
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
          _version
          _deleted
          _lastChangedAt
          updatedAt
        }
        nextToken
        startedAt
      }
      filters {
        items {
          id
          stateID
          filterID
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        nextToken
        startedAt
      }
      _version
      _deleted
      _lastChangedAt
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
        camera
        projectID
        project {
          id
          name
          description
          filePath
          properties
          author
          shared
          files
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        comments {
          nextToken
          startedAt
        }
        filters {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncStateFilters = /* GraphQL */ `
  query SyncStateFilters(
    $filter: ModelStateFilterFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncStateFilters(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        stateID
        filterID
        state {
          id
          title
          description
          camera
          projectID
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        filter {
          id
          name
          projectID
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncColumnFilters = /* GraphQL */ `
  query SyncColumnFilters(
    $filter: ModelColumnFilterFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncColumnFilters(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        columnID
        filterID
        column {
          id
          name
          min
          max
          projectID
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        filter {
          id
          name
          projectID
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncColumns = /* GraphQL */ `
  query SyncColumns(
    $filter: ModelColumnFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncColumns(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
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
          properties
          author
          shared
          files
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        filters {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getColumn = /* GraphQL */ `
  query GetColumn($id: ID!) {
    getColumn(id: $id) {
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
        properties
        author
        shared
        files
        states {
          nextToken
          startedAt
        }
        filters {
          nextToken
          startedAt
        }
        columns {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      filters {
        items {
          id
          columnID
          filterID
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        nextToken
        startedAt
      }
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const listColumns = /* GraphQL */ `
  query ListColumns(
    $filter: ModelColumnFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listColumns(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
          properties
          author
          shared
          files
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        filters {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncFilters = /* GraphQL */ `
  query SyncFilters(
    $filter: ModelFilterFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncFilters(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        name
        projectID
        project {
          id
          name
          description
          filePath
          properties
          author
          shared
          files
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        columns {
          nextToken
          startedAt
        }
        states {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getFilter = /* GraphQL */ `
  query GetFilter($id: ID!) {
    getFilter(id: $id) {
      id
      name
      projectID
      project {
        id
        name
        description
        filePath
        properties
        author
        shared
        files
        states {
          nextToken
          startedAt
        }
        filters {
          nextToken
          startedAt
        }
        columns {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      columns {
        items {
          id
          columnID
          filterID
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        nextToken
        startedAt
      }
      states {
        items {
          id
          stateID
          filterID
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        nextToken
        startedAt
      }
      _version
      _deleted
      _lastChangedAt
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
        projectID
        project {
          id
          name
          description
          filePath
          properties
          author
          shared
          files
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        columns {
          nextToken
          startedAt
        }
        states {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncComments = /* GraphQL */ `
  query SyncComments(
    $filter: ModelCommentFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncComments(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        author
        stateID
        state {
          id
          title
          description
          camera
          projectID
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        content
        createdAt
        _version
        _deleted
        _lastChangedAt
        updatedAt
      }
      nextToken
      startedAt
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
        camera
        projectID
        project {
          id
          name
          description
          filePath
          properties
          author
          shared
          files
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        comments {
          nextToken
          startedAt
        }
        filters {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      content
      createdAt
      _version
      _deleted
      _lastChangedAt
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
          camera
          projectID
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        content
        createdAt
        _version
        _deleted
        _lastChangedAt
        updatedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const searchProjects = /* GraphQL */ `
  query SearchProjects(
    $filter: SearchableProjectFilterInput
    $sort: SearchableProjectSortInput
    $limit: Int
    $nextToken: String
    $from: Int
  ) {
    searchProjects(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
    ) {
      items {
        id
        name
        description
        filePath
        properties
        author
        shared
        files
        states {
          nextToken
          startedAt
        }
        filters {
          nextToken
          startedAt
        }
        columns {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      total
    }
  }
`;
export const searchStates = /* GraphQL */ `
  query SearchStates(
    $filter: SearchableStateFilterInput
    $sort: SearchableStateSortInput
    $limit: Int
    $nextToken: String
    $from: Int
  ) {
    searchStates(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
    ) {
      items {
        id
        title
        description
        camera
        projectID
        project {
          id
          name
          description
          filePath
          properties
          author
          shared
          files
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        comments {
          nextToken
          startedAt
        }
        filters {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      total
    }
  }
`;
export const searchColumns = /* GraphQL */ `
  query SearchColumns(
    $filter: SearchableColumnFilterInput
    $sort: SearchableColumnSortInput
    $limit: Int
    $nextToken: String
    $from: Int
  ) {
    searchColumns(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
    ) {
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
          properties
          author
          shared
          files
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        filters {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      total
    }
  }
`;
export const searchFilters = /* GraphQL */ `
  query SearchFilters(
    $filter: SearchableFilterFilterInput
    $sort: SearchableFilterSortInput
    $limit: Int
    $nextToken: String
    $from: Int
  ) {
    searchFilters(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
    ) {
      items {
        id
        name
        projectID
        project {
          id
          name
          description
          filePath
          properties
          author
          shared
          files
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        columns {
          nextToken
          startedAt
        }
        states {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      nextToken
      total
    }
  }
`;
export const searchComments = /* GraphQL */ `
  query SearchComments(
    $filter: SearchableCommentFilterInput
    $sort: SearchableCommentSortInput
    $limit: Int
    $nextToken: String
    $from: Int
  ) {
    searchComments(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
    ) {
      items {
        id
        author
        stateID
        state {
          id
          title
          description
          camera
          projectID
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        content
        createdAt
        _version
        _deleted
        _lastChangedAt
        updatedAt
      }
      nextToken
      total
    }
  }
`;
