import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_NAME, response, publishEvent } from "./utils.js";

export const handler = async (event) => {
  const { id } = event.pathParameters;

  let deleted;
  try {
    const result = await ddb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id },
        ConditionExpression: "attribute_exists(id)",
        ReturnValues: "ALL_OLD", // devuelve el TODO borrado
      })
    );
    deleted = result.Attributes;
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return response(404, { message: `TODO ${id} no existe` });
    }
    throw err;
  }

  await publishEvent("todo.deleted", deleted);
  return response(204);
};