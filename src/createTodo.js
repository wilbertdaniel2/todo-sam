import { randomUUID } from "node:crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_NAME, response, parseBody } from "./utils.js";

export const handler = async (event) => {
  const data = parseBody(event);
  if (data === null) {
    return response(400, { message: "El body debe ser JSON válido" });
  }

  const title = String(data.title ?? "").trim();
  if (!title) {
    return response(400, { message: "El campo 'title' es obligatorio" });
  }

  const now = new Date().toISOString();
  const item = {
    id: randomUUID(),
    title,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return response(201, item);
};