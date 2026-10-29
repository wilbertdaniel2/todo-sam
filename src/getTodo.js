import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_NAME, response } from "./utils.js";

export const handler = async (event) => {
  const { id } = event.pathParameters;

  const result = await ddb.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id } })
  );

  if (!result.Item) {
    return response(404, { message: `TODO ${id} no existe` });
  }
  return response(200, result.Item);
};