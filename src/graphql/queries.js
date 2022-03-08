/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getProject = /* GraphQL */ `
  query GetProject($id: ID!) {
    getProject(id: $id) {
      id
      name
      description
      filePath
      properties
      url
      author
      shared
      files
      states {
        items {
          id
          title
          description
          camera
          query
          projectID
          project {
            id
            name
            description
            filePath
            properties
            url
            author
            shared
            files
            states {
              nextToken
            }
            filters {
              nextToken
            }
            columns {
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
        nextToken
      }
      filters {
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
            url
            author
            shared
            files
            states {
              nextToken
            }
            filters {
              nextToken
            }
            columns {
              nextToken
            }
            createdAt
            updatedAt
          }
          columns {
            items {
              id
              columnID
              filterID
              createdAt
              updatedAt
            }
            nextToken
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
        nextToken
      }
      columns {
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
            url
            author
            shared
            files
            states {
              nextToken
            }
            filters {
              nextToken
            }
            columns {
              nextToken
            }
            createdAt
            updatedAt
          }
          filters {
            items {
              id
              columnID
              filterID
              createdAt
              updatedAt
            }
            nextToken
          }
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
        properties
        url
        author
        shared
        files
        states {
          items {
            id
            title
            description
            camera
            query
            projectID
            project {
              id
              name
              description
              filePath
              properties
              url
              author
              shared
              files
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
        filters {
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
              url
              author
              shared
              files
              createdAt
              updatedAt
            }
            columns {
              nextToken
            }
            states {
              nextToken
            }
            createdAt
            updatedAt
          }
          nextToken
        }
        columns {
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
              url
              author
              shared
              files
              createdAt
              updatedAt
            }
            filters {
              nextToken
            }
            createdAt
            updatedAt
          }
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
      camera
      query
      projectID
      project {
        id
        name
        description
        filePath
        properties
        url
        author
        shared
        files
        states {
          items {
            id
            title
            description
            camera
            query
            projectID
            project {
              id
              name
              description
              filePath
              properties
              url
              author
              shared
              files
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
        filters {
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
              url
              author
              shared
              files
              createdAt
              updatedAt
            }
            columns {
              nextToken
            }
            states {
              nextToken
            }
            createdAt
            updatedAt
          }
          nextToken
        }
        columns {
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
              url
              author
              shared
              files
              createdAt
              updatedAt
            }
            filters {
              nextToken
            }
            createdAt
            updatedAt
          }
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
          state {
            id
            title
            description
            camera
            query
            projectID
            project {
              id
              name
              description
              filePath
              properties
              url
              author
              shared
              files
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
        nextToken
      }
      filters {
        items {
          id
          stateID
          filterID
          state {
            id
            title
            description
            camera
            query
            projectID
            project {
              id
              name
              description
              filePath
              properties
              url
              author
              shared
              files
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
          filter {
            id
            name
            projectID
            project {
              id
              name
              description
              filePath
              properties
              url
              author
              shared
              files
              createdAt
              updatedAt
            }
            columns {
              nextToken
            }
            states {
              nextToken
            }
            createdAt
            updatedAt
          }
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
        camera
        query
        projectID
        project {
          id
          name
          description
          filePath
          properties
          url
          author
          shared
          files
          states {
            items {
              id
              title
              description
              camera
              query
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
              projectID
              createdAt
              updatedAt
            }
            nextToken
          }
          columns {
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
        comments {
          items {
            id
            author
            stateID
            state {
              id
              title
              description
              camera
              query
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
        filters {
          items {
            id
            stateID
            filterID
            state {
              id
              title
              description
              camera
              query
              projectID
              createdAt
              updatedAt
            }
            filter {
              id
              name
              projectID
              createdAt
              updatedAt
            }
            createdAt
            updatedAt
          }
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
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
        url
        author
        shared
        files
        states {
          items {
            id
            title
            description
            camera
            query
            projectID
            project {
              id
              name
              description
              filePath
              properties
              url
              author
              shared
              files
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
        filters {
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
              url
              author
              shared
              files
              createdAt
              updatedAt
            }
            columns {
              nextToken
            }
            states {
              nextToken
            }
            createdAt
            updatedAt
          }
          nextToken
        }
        columns {
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
              url
              author
              shared
              files
              createdAt
              updatedAt
            }
            filters {
              nextToken
            }
            createdAt
            updatedAt
          }
          nextToken
        }
        createdAt
        updatedAt
      }
      filters {
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
            project {
              id
              name
              description
              filePath
              properties
              url
              author
              shared
              files
              createdAt
              updatedAt
            }
            filters {
              nextToken
            }
            createdAt
            updatedAt
          }
          filter {
            id
            name
            projectID
            project {
              id
              name
              description
              filePath
              properties
              url
              author
              shared
              files
              createdAt
              updatedAt
            }
            columns {
              nextToken
            }
            states {
              nextToken
            }
            createdAt
            updatedAt
          }
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
          url
          author
          shared
          files
          states {
            items {
              id
              title
              description
              camera
              query
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
              projectID
              createdAt
              updatedAt
            }
            nextToken
          }
          columns {
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
        filters {
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
              createdAt
              updatedAt
            }
            filter {
              id
              name
              projectID
              createdAt
              updatedAt
            }
            createdAt
            updatedAt
          }
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
      projectID
      project {
        id
        name
        description
        filePath
        properties
        url
        author
        shared
        files
        states {
          items {
            id
            title
            description
            camera
            query
            projectID
            project {
              id
              name
              description
              filePath
              properties
              url
              author
              shared
              files
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
        filters {
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
              url
              author
              shared
              files
              createdAt
              updatedAt
            }
            columns {
              nextToken
            }
            states {
              nextToken
            }
            createdAt
            updatedAt
          }
          nextToken
        }
        columns {
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
              url
              author
              shared
              files
              createdAt
              updatedAt
            }
            filters {
              nextToken
            }
            createdAt
            updatedAt
          }
          nextToken
        }
        createdAt
        updatedAt
      }
      columns {
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
            project {
              id
              name
              description
              filePath
              properties
              url
              author
              shared
              files
              createdAt
              updatedAt
            }
            filters {
              nextToken
            }
            createdAt
            updatedAt
          }
          filter {
            id
            name
            projectID
            project {
              id
              name
              description
              filePath
              properties
              url
              author
              shared
              files
              createdAt
              updatedAt
            }
            columns {
              nextToken
            }
            states {
              nextToken
            }
            createdAt
            updatedAt
          }
          createdAt
          updatedAt
        }
        nextToken
      }
      states {
        items {
          id
          stateID
          filterID
          state {
            id
            title
            description
            camera
            query
            projectID
            project {
              id
              name
              description
              filePath
              properties
              url
              author
              shared
              files
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
          filter {
            id
            name
            projectID
            project {
              id
              name
              description
              filePath
              properties
              url
              author
              shared
              files
              createdAt
              updatedAt
            }
            columns {
              nextToken
            }
            states {
              nextToken
            }
            createdAt
            updatedAt
          }
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
        projectID
        project {
          id
          name
          description
          filePath
          properties
          url
          author
          shared
          files
          states {
            items {
              id
              title
              description
              camera
              query
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
              projectID
              createdAt
              updatedAt
            }
            nextToken
          }
          columns {
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
        columns {
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
              createdAt
              updatedAt
            }
            filter {
              id
              name
              projectID
              createdAt
              updatedAt
            }
            createdAt
            updatedAt
          }
          nextToken
        }
        states {
          items {
            id
            stateID
            filterID
            state {
              id
              title
              description
              camera
              query
              projectID
              createdAt
              updatedAt
            }
            filter {
              id
              name
              projectID
              createdAt
              updatedAt
            }
            createdAt
            updatedAt
          }
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
        camera
        query
        projectID
        project {
          id
          name
          description
          filePath
          properties
          url
          author
          shared
          files
          states {
            items {
              id
              title
              description
              camera
              query
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
              projectID
              createdAt
              updatedAt
            }
            nextToken
          }
          columns {
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
        comments {
          items {
            id
            author
            stateID
            state {
              id
              title
              description
              camera
              query
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
        filters {
          items {
            id
            stateID
            filterID
            state {
              id
              title
              description
              camera
              query
              projectID
              createdAt
              updatedAt
            }
            filter {
              id
              name
              projectID
              createdAt
              updatedAt
            }
            createdAt
            updatedAt
          }
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
          camera
          query
          projectID
          project {
            id
            name
            description
            filePath
            properties
            url
            author
            shared
            files
            states {
              nextToken
            }
            filters {
              nextToken
            }
            columns {
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
        content
        createdAt
        updatedAt
      }
      nextToken
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
        url
        author
        shared
        files
        states {
          items {
            id
            title
            description
            camera
            query
            projectID
            project {
              id
              name
              description
              filePath
              properties
              url
              author
              shared
              files
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
        filters {
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
              url
              author
              shared
              files
              createdAt
              updatedAt
            }
            columns {
              nextToken
            }
            states {
              nextToken
            }
            createdAt
            updatedAt
          }
          nextToken
        }
        columns {
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
              url
              author
              shared
              files
              createdAt
              updatedAt
            }
            filters {
              nextToken
            }
            createdAt
            updatedAt
          }
          nextToken
        }
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
        query
        projectID
        project {
          id
          name
          description
          filePath
          properties
          url
          author
          shared
          files
          states {
            items {
              id
              title
              description
              camera
              query
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
              projectID
              createdAt
              updatedAt
            }
            nextToken
          }
          columns {
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
        comments {
          items {
            id
            author
            stateID
            state {
              id
              title
              description
              camera
              query
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
        filters {
          items {
            id
            stateID
            filterID
            state {
              id
              title
              description
              camera
              query
              projectID
              createdAt
              updatedAt
            }
            filter {
              id
              name
              projectID
              createdAt
              updatedAt
            }
            createdAt
            updatedAt
          }
          nextToken
        }
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
          url
          author
          shared
          files
          states {
            items {
              id
              title
              description
              camera
              query
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
              projectID
              createdAt
              updatedAt
            }
            nextToken
          }
          columns {
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
        filters {
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
              createdAt
              updatedAt
            }
            filter {
              id
              name
              projectID
              createdAt
              updatedAt
            }
            createdAt
            updatedAt
          }
          nextToken
        }
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
          url
          author
          shared
          files
          states {
            items {
              id
              title
              description
              camera
              query
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
              projectID
              createdAt
              updatedAt
            }
            nextToken
          }
          columns {
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
        columns {
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
              createdAt
              updatedAt
            }
            filter {
              id
              name
              projectID
              createdAt
              updatedAt
            }
            createdAt
            updatedAt
          }
          nextToken
        }
        states {
          items {
            id
            stateID
            filterID
            state {
              id
              title
              description
              camera
              query
              projectID
              createdAt
              updatedAt
            }
            filter {
              id
              name
              projectID
              createdAt
              updatedAt
            }
            createdAt
            updatedAt
          }
          nextToken
        }
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
          query
          projectID
          project {
            id
            name
            description
            filePath
            properties
            url
            author
            shared
            files
            states {
              nextToken
            }
            filters {
              nextToken
            }
            columns {
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
        content
        createdAt
        updatedAt
      }
      nextToken
      total
    }
  }
`;
