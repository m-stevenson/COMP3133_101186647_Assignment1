import { gql } from "graphql-tag";

const employeeSchema = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  type Employee {
    _id: ID!
    first_name: String!
    last_name: String!
    email: String!
    gender: String
    designation: String!
    salary: Float!
    date_of_joining: String!
    department: String!
    employee_photo: String
  }

  type Query {
    login(usernameOrEmail: String!, password: String!): AuthPayload

    getAllEmployees: [Employee!]!

    getEmployeeById(eid: ID!): Employee

    searchEmployees(designation: String, department: String): [Employee!]!
  }

  type Mutation {
    signup(username: String!, email: String!, password: String!): AuthPayload

    addEmployee(
      first_name: String!
      last_name: String!
      email: String!
      gender: String
      designation: String!
      salary: Float!
      date_of_joining: String!
      department: String!
      employee_photo_base64: String
    ): Employee

    updateEmployee(
      eid: ID!
      first_name: String
      last_name: String
      email: String
      gender: String
      designation: String
      salary: Float
      date_of_joining: String
      department: String
      employee_photo_base64: String
    ): Employee

    deleteEmployeeById(eid: ID!): Boolean
  }
`;

export default employeeSchema;
