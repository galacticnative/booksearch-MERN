const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth'); 

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
              const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
                .populate('books');
          
              return userData;
            }
          
            throw new AuthenticationError('Not logged in');
        },

        // // get all users
        // users: async () => {
        //     return User.find()
        //     .select('-__v -password')
        //     .populate('books');
        // },
        // // get a user by username
        // user: async (parent, { username }) => {
        //     return User.findOne({ username })
        //     .select('-__v -password')
        //     .populate('books');
        // },
        // books: async (parent, { title }) => {
        //     const params = title ? { title } : {};
        //     return Book.find(params).sort({ createdAt: -1 });
        // },
        // // place this inside of the `Query` nested object right after `books` 
        // book: async (parent, { bookId }) => {
        //     return Book.findOne({ bookId });
        // },
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            
            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }
            
            const correctPw = await user.isCorrectPassword(password);
            
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, { input }, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: input } },
                { new: true }
                );
            
                return updatedUser;
            }
            
            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    {_id: context.user._id },
                    { $pull: {savedBooks: { bookId: args.bookId } } },
                    { new: true }
                );

                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    }
    
};
  
module.exports = resolvers;