import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_NAME, response } from "./utils.js";

export const handler = async (event) => {
  const { id } = event.pathParameters;

  try {
    await ddb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id },
        ConditionExpression: "attribute_exists(id)",
      })
    );
    return response(204);
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return response(404, { message: `TODO ${id} no existe` });
    }
    throw err;
  }
};