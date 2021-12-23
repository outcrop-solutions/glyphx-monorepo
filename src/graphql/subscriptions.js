/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateProject = /* GraphQL */ `
  subscription OnCreateProject {
    onCreateProject {
      id
      name
      description
      filePath
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
  }
`;
export const onUpdateProject = /* GraphQL */ `
  subscription OnUpdateProject {
    onUpdateProject {
      id
      name
      description
      filePath
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
  }
`;
export const onDeleteProject = /* GraphQL */ `
  subscription OnDeleteProject {
    onDeleteProject {
      id
      name
      description
      filePath
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
  }
`;
export const onCreateState = /* GraphQL */ `
  subscription OnCreateState {
    onCreateState {
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
  }
`;
export const onUpdateState = /* GraphQL */ `
  subscription OnUpdateState {
    onUpdateState {
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
  }
`;
export const onDeleteState = /* GraphQL */ `
  subscription OnDeleteState {
    onDeleteState {
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
  }
`;
export const onCreateStateFilter = /* GraphQL */ `
  subscription OnCreateStateFilter {
    onCreateStateFilter {
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
  }
`;
export const onUpdateStateFilter = /* GraphQL */ `
  subscription OnUpdateStateFilter {
    onUpdateStateFilter {
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
  }
`;
export const onDeleteStateFilter = /* GraphQL */ `
  subscription OnDeleteStateFilter {
    onDeleteStateFilter {
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
  }
`;
export const onCreateColumnFilter = /* GraphQL */ `
  subscription OnCreateColumnFilter {
    onCreateColumnFilter {
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
  }
`;
export const onUpdateColumnFilter = /* GraphQL */ `
  subscription OnUpdateColumnFilter {
    onUpdateColumnFilter {
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
  }
`;
export const onDeleteColumnFilter = /* GraphQL */ `
  subscription OnDeleteColumnFilter {
    onDeleteColumnFilter {
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
  }
`;
export const onCreateColumn = /* GraphQL */ `
  subscription OnCreateColumn {
    onCreateColumn {
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
  }
`;
export const onUpdateColumn = /* GraphQL */ `
  subscription OnUpdateColumn {
    onUpdateColumn {
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
  }
`;
export const onDeleteColumn = /* GraphQL */ `
  subscription OnDeleteColumn {
    onDeleteColumn {
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
  }
`;
export const onCreateFilter = /* GraphQL */ `
  subscription OnCreateFilter {
    onCreateFilter {
      id
      name
      projectID
      project {
        id
        name
        description
        filePath
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
  }
`;
export const onUpdateFilter = /* GraphQL */ `
  subscription OnUpdateFilter {
    onUpdateFilter {
      id
      name
      projectID
      project {
        id
        name
        description
        filePath
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
  }
`;
export const onDeleteFilter = /* GraphQL */ `
  subscription OnDeleteFilter {
    onDeleteFilter {
      id
      name
      projectID
      project {
        id
        name
        description
        filePath
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
  }
`;
export const onCreateComment = /* GraphQL */ `
  subscription OnCreateComment {
    onCreateComment {
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
  }
`;
export const onUpdateComment = /* GraphQL */ `
  subscription OnUpdateComment {
    onUpdateComment {
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
  }
`;
export const onDeleteComment = /* GraphQL */ `
  subscription OnDeleteComment {
    onDeleteComment {
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
  }
`;
