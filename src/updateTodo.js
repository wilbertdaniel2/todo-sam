import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_NAME, response, parseBody } from "./utils.js";

export const handler = async (event) => {
  const { id } = event.pathParameters;
  const data = parseBody(event);
  if (data === null) {
    return response(400, { message: "El body debe ser JSON válido" });
  }

  // Construimos el UpdateExpression solo con los campos enviados
  const sets = ["updatedAt = :u"];
  const values = { ":u": new Date().toISOString() };
  const names = {};

  if ("title" in data) {
    const title = String(data.title).trim();
    if (!title) {
      return response(400, { message: "'title' no puede estar vacío" });
    }
    sets.push("#t = :t");
    names["#t"] = "title";
    values[":t"] = title;
  }

  if ("completed" in data) {
    if (typeof data.completed !== "boolean") {
      return response(400, { message: "'completed' debe ser true/false" });
    }
    sets.push("completed = :c");
    values[":c"] = data.completed;
  }

  if (sets.length === 1) {
    return response(400, { message: "Envía 'title' y/o 'completed'" });
  }

  try {
    const result = await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: "SET " + sets.join(", "),
        ExpressionAttributeValues: values,
        ...(Object.keys(names).length && { ExpressionAttributeNames: names }),
        ConditionExpression: "attribute_exists(id)",
        ReturnValues: "ALL_NEW",
      })
    );
    return response(200, result.Attributes);
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return response(404, { message: `TODO ${id} no existe` });
    }
    throw err;
  }
};