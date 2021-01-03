import gql from 'graphql-tag'

export const GET_ME = gql`
  {
    me {
      _id
      username
      email
      bookCount
      books {
        authors
        description
        bookId
        image
        link
        title
      }
    }
  }
`;