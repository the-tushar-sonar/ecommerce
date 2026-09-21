import User from "./user.model.js";

export const findUserByEmail = async (email) => {
    return User.findOne({ email });
};

export const findUserByEmailWithPassword = async (email) => {
    return User.findOne({ email }).select("+password");
};

export const findUserById = async (userId) => {
    return User.findById(userId);
};

export const createUser = async (userData) => {
    return User.create(userData);
};
