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
      _version
      _deleted
      _lastChangedAt
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
      _version
      _deleted
      _lastChangedAt
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
      _version
      _deleted
      _lastChangedAt
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
      _version
      _deleted
      _lastChangedAt
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
      _version
      _deleted
      _lastChangedAt
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
      _version
      _deleted
      _lastChangedAt
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
