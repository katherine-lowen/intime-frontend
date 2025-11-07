// src/lib/users.ts
import { get, post } from "./api";

export async function listUsers() {
  return get("/users");
}

export async function createUser(data: any) {
  return post("/users", data);
}
