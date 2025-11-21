// src/lib/users.ts
import api from "./api";

type CreateUserInput = {
  email: string;
  name?: string | null;
};

export async function listUsers() {
  return api.get<any[]>("/users");
}

export async function createUser(input: CreateUserInput) {
  return api.post("/users", input);
}
