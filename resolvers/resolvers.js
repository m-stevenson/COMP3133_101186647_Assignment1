import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Employee from "../models/Employee.js";
import cloudinary from "../config/cloudinary.js";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function formatMongooseError(err) {
  if (err?.name === "ValidationError" && err?.errors) {
    return Object.values(err.errors)
      .map((e) => e.message)
      .join(" | ");
  }
  if (err?.code === 11000 && err?.keyValue) {
    const field = Object.keys(err.keyValue)[0];
    return `${field} already exists`;
  }
  if (err?.name === "CastError") {
    return `Invalid value for ${err.path}: ${err.value}`;
  }
  return err?.message || "Unknown error";
}

async function uploadPhoto(base64DataUri) {
  if (!base64DataUri) return null;
  const res = await cloudinary.uploader.upload(base64DataUri, {
    folder: "employees",
    resource_type: "image",
  });
  return res.secure_url;
}

const resolvers = {
  Query: {
    login: async (_, { usernameOrEmail, password }) => {
      try {
        const user = await User.findOne({
          $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        }).select("+password");

        if (!user) throw new Error("Invalid credentials");

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new Error("Invalid credentials");

        const token = jwt.sign(
          { userId: user._id, username: user.username },
          process.env.JWT_SECRET
        );

        return {
          user: { _id: user._id, username: user.username, email: user.email },
          token,
        };
      } catch (err) {
        throw new Error(formatMongooseError(err));
      }
    },

    getAllEmployees: async () => {
      try {
        return await Employee.find();
      } catch (err) {
        throw new Error(formatMongooseError(err));
      }
    },

    getEmployeeById: async (_, { eid }) => {
      try {
        if (!isValidObjectId(eid)) throw new Error("Invalid employee id");
        return await Employee.findById(eid);
      } catch (err) {
        throw new Error(formatMongooseError(err));
      }
    },

    searchEmployees: async (_, { designation, department }) => {
      try {
        const query = {};
        if (designation) query.designation = designation;
        if (department) query.department = department;
        return await Employee.find(query);
      } catch (err) {
        throw new Error(formatMongooseError(err));
      }
    },
  },

  Mutation: {
    signup: async (_, { username, email, password }) => {
      try {
        const user = new User({ username, email, password });
        await user.save();

        const token = jwt.sign(
          { userId: user._id, username: user.username },
          process.env.JWT_SECRET
        );

        return {
          user: { _id: user._id, username: user.username, email: user.email },
          token,
        };
      } catch (err) {
        throw new Error(formatMongooseError(err));
      }
    },

    addEmployee: async (
      _,
      {
        first_name,
        last_name,
        email,
        gender,
        designation,
        salary,
        date_of_joining,
        department,
        employee_photo_base64,
      }
    ) => {
      try {
        const photoUrl = await uploadPhoto(employee_photo_base64);

        const employee = new Employee({
          first_name,
          last_name,
          email,
          gender,
          designation,
          salary,
          date_of_joining: new Date(date_of_joining),
          department,
          employee_photo: photoUrl,
        });

        return await employee.save();
      } catch (err) {
        throw new Error(formatMongooseError(err));
      }
    },

    updateEmployee: async (_, { eid, ...updates }) => {
      try {
        if (!isValidObjectId(eid)) throw new Error("Invalid employee id");

        if (updates.employee_photo_base64) {
          updates.employee_photo = await uploadPhoto(
            updates.employee_photo_base64
          );
          delete updates.employee_photo_base64;
        }

        if (updates.date_of_joining) {
          updates.date_of_joining = new Date(updates.date_of_joining);
        }

        return await Employee.findByIdAndUpdate(eid, updates, {
          new: true,
          runValidators: true,
        });
      } catch (err) {
        throw new Error(formatMongooseError(err));
      }
    },

    deleteEmployeeById: async (_, { eid }) => {
      try {
        if (!isValidObjectId(eid)) throw new Error("Invalid employee id");
        const deleted = await Employee.findByIdAndDelete(eid);
        return !!deleted;
      } catch (err) {
        throw new Error(formatMongooseError(err));
      }
    },
  },
};

export default resolvers;