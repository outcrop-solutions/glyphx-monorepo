/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateProject = /* GraphQL */ `
  subscription OnCreateProject {
    onCreateProject {
      id
      name
      description
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
          title
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
          title
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
          title
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
          stateID
          content
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
          stateID
          content
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
          stateID
          content
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
      title
      projectID
      project {
        id
        name
        description
        states {
          nextToken
        }
        filters {
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
export const onUpdateFilter = /* GraphQL */ `
  subscription OnUpdateFilter {
    onUpdateFilter {
      id
      title
      projectID
      project {
        id
        name
        description
        states {
          nextToken
        }
        filters {
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
export const onDeleteFilter = /* GraphQL */ `
  subscription OnDeleteFilter {
    onDeleteFilter {
      id
      title
      projectID
      project {
        id
        name
        description
        states {
          nextToken
        }
        filters {
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
export const onCreateComment = /* GraphQL */ `
  subscription OnCreateComment {
    onCreateComment {
      id
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
          createdAt
          updatedAt
        }
        comments {
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
          createdAt
          updatedAt
        }
        comments {
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
          createdAt
          updatedAt
        }
        comments {
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
