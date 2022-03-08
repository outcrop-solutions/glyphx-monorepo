/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createProject = /* GraphQL */ `
  mutation CreateProject(
    $input: CreateProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    createProject(input: $input, condition: $condition) {
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
export const updateProject = /* GraphQL */ `
  mutation UpdateProject(
    $input: UpdateProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    updateProject(input: $input, condition: $condition) {
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
export const deleteProject = /* GraphQL */ `
  mutation DeleteProject(
    $input: DeleteProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    deleteProject(input: $input, condition: $condition) {
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
export const createState = /* GraphQL */ `
  mutation CreateState(
    $input: CreateStateInput!
    $condition: ModelStateConditionInput
  ) {
    createState(input: $input, condition: $condition) {
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
export const updateState = /* GraphQL */ `
  mutation UpdateState(
    $input: UpdateStateInput!
    $condition: ModelStateConditionInput
  ) {
    updateState(input: $input, condition: $condition) {
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
export const deleteState = /* GraphQL */ `
  mutation DeleteState(
    $input: DeleteStateInput!
    $condition: ModelStateConditionInput
  ) {
    deleteState(input: $input, condition: $condition) {
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
export const createStateFilter = /* GraphQL */ `
  mutation CreateStateFilter(
    $input: CreateStateFilterInput!
    $condition: ModelStateFilterConditionInput
  ) {
    createStateFilter(input: $input, condition: $condition) {
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
      createdAt
      updatedAt
    }
  }
`;
export const updateStateFilter = /* GraphQL */ `
  mutation UpdateStateFilter(
    $input: UpdateStateFilterInput!
    $condition: ModelStateFilterConditionInput
  ) {
    updateStateFilter(input: $input, condition: $condition) {
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
      createdAt
      updatedAt
    }
  }
`;
export const deleteStateFilter = /* GraphQL */ `
  mutation DeleteStateFilter(
    $input: DeleteStateFilterInput!
    $condition: ModelStateFilterConditionInput
  ) {
    deleteStateFilter(input: $input, condition: $condition) {
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
      createdAt
      updatedAt
    }
  }
`;
export const createColumnFilter = /* GraphQL */ `
  mutation CreateColumnFilter(
    $input: CreateColumnFilterInput!
    $condition: ModelColumnFilterConditionInput
  ) {
    createColumnFilter(input: $input, condition: $condition) {
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
      createdAt
      updatedAt
    }
  }
`;
export const updateColumnFilter = /* GraphQL */ `
  mutation UpdateColumnFilter(
    $input: UpdateColumnFilterInput!
    $condition: ModelColumnFilterConditionInput
  ) {
    updateColumnFilter(input: $input, condition: $condition) {
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
      createdAt
      updatedAt
    }
  }
`;
export const deleteColumnFilter = /* GraphQL */ `
  mutation DeleteColumnFilter(
    $input: DeleteColumnFilterInput!
    $condition: ModelColumnFilterConditionInput
  ) {
    deleteColumnFilter(input: $input, condition: $condition) {
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
      createdAt
      updatedAt
    }
  }
`;
export const createColumn = /* GraphQL */ `
  mutation CreateColumn(
    $input: CreateColumnInput!
    $condition: ModelColumnConditionInput
  ) {
    createColumn(input: $input, condition: $condition) {
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
export const updateColumn = /* GraphQL */ `
  mutation UpdateColumn(
    $input: UpdateColumnInput!
    $condition: ModelColumnConditionInput
  ) {
    updateColumn(input: $input, condition: $condition) {
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
export const deleteColumn = /* GraphQL */ `
  mutation DeleteColumn(
    $input: DeleteColumnInput!
    $condition: ModelColumnConditionInput
  ) {
    deleteColumn(input: $input, condition: $condition) {
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
export const createFilter = /* GraphQL */ `
  mutation CreateFilter(
    $input: CreateFilterInput!
    $condition: ModelFilterConditionInput
  ) {
    createFilter(input: $input, condition: $condition) {
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
export const updateFilter = /* GraphQL */ `
  mutation UpdateFilter(
    $input: UpdateFilterInput!
    $condition: ModelFilterConditionInput
  ) {
    updateFilter(input: $input, condition: $condition) {
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
export const deleteFilter = /* GraphQL */ `
  mutation DeleteFilter(
    $input: DeleteFilterInput!
    $condition: ModelFilterConditionInput
  ) {
    deleteFilter(input: $input, condition: $condition) {
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
export const createComment = /* GraphQL */ `
  mutation CreateComment(
    $input: CreateCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    createComment(input: $input, condition: $condition) {
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
export const updateComment = /* GraphQL */ `
  mutation UpdateComment(
    $input: UpdateCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    updateComment(input: $input, condition: $condition) {
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
export const deleteComment = /* GraphQL */ `
  mutation DeleteComment(
    $input: DeleteCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    deleteComment(input: $input, condition: $condition) {
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
