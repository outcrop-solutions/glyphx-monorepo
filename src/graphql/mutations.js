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
      author
      states {
        items {
          id
          title
          description
          camera
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
      author
      states {
        items {
          id
          title
          description
          camera
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
      author
      states {
        items {
          id
          title
          description
          camera
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
      projectID
      project {
        id
        name
        description
        filePath
        author
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
      projectID
      project {
        id
        name
        description
        filePath
        author
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
      projectID
      project {
        id
        name
        description
        filePath
        author
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
        projectID
        project {
          id
          name
          description
          filePath
          author
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
        columns {
          nextToken
        }
        projectID
        project {
          id
          name
          description
          filePath
          author
          createdAt
          updatedAt
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
        projectID
        project {
          id
          name
          description
          filePath
          author
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
        columns {
          nextToken
        }
        projectID
        project {
          id
          name
          description
          filePath
          author
          createdAt
          updatedAt
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
        projectID
        project {
          id
          name
          description
          filePath
          author
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
        columns {
          nextToken
        }
        projectID
        project {
          id
          name
          description
          filePath
          author
          createdAt
          updatedAt
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
      filterID
      filter {
        id
        name
        columns {
          nextToken
        }
        projectID
        project {
          id
          name
          description
          filePath
          author
          createdAt
          updatedAt
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
      filterID
      filter {
        id
        name
        columns {
          nextToken
        }
        projectID
        project {
          id
          name
          description
          filePath
          author
          createdAt
          updatedAt
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
      filterID
      filter {
        id
        name
        columns {
          nextToken
        }
        projectID
        project {
          id
          name
          description
          filePath
          author
          createdAt
          updatedAt
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
      columns {
        items {
          id
          name
          min
          max
          filterID
          createdAt
          updatedAt
        }
        nextToken
      }
      projectID
      project {
        id
        name
        description
        filePath
        author
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
export const updateFilter = /* GraphQL */ `
  mutation UpdateFilter(
    $input: UpdateFilterInput!
    $condition: ModelFilterConditionInput
  ) {
    updateFilter(input: $input, condition: $condition) {
      id
      name
      columns {
        items {
          id
          name
          min
          max
          filterID
          createdAt
          updatedAt
        }
        nextToken
      }
      projectID
      project {
        id
        name
        description
        filePath
        author
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
export const deleteFilter = /* GraphQL */ `
  mutation DeleteFilter(
    $input: DeleteFilterInput!
    $condition: ModelFilterConditionInput
  ) {
    deleteFilter(input: $input, condition: $condition) {
      id
      name
      columns {
        items {
          id
          name
          min
          max
          filterID
          createdAt
          updatedAt
        }
        nextToken
      }
      projectID
      project {
        id
        name
        description
        filePath
        author
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
        projectID
        project {
          id
          name
          description
          filePath
          author
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
        projectID
        project {
          id
          name
          description
          filePath
          author
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
        projectID
        project {
          id
          name
          description
          filePath
          author
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
