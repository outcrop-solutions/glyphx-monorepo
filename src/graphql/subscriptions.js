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
export const onUpdateProject = /* GraphQL */ `
  subscription OnUpdateProject {
    onUpdateProject {
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
export const onDeleteProject = /* GraphQL */ `
  subscription OnDeleteProject {
    onDeleteProject {
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
export const onCreateState = /* GraphQL */ `
  subscription OnCreateState {
    onCreateState {
      id
      title
      description
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
export const onUpdateState = /* GraphQL */ `
  subscription OnUpdateState {
    onUpdateState {
      id
      title
      description
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
export const onDeleteState = /* GraphQL */ `
  subscription OnDeleteState {
    onDeleteState {
      id
      title
      description
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
        min
        max
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
        min
        max
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
        min
        max
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
export const onCreateFilter = /* GraphQL */ `
  subscription OnCreateFilter {
    onCreateFilter {
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
export const onUpdateFilter = /* GraphQL */ `
  subscription OnUpdateFilter {
    onUpdateFilter {
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
export const onDeleteFilter = /* GraphQL */ `
  subscription OnDeleteFilter {
    onDeleteFilter {
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
