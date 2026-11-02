import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, AUDIT_TABLE_NAME, response } from "./utils.js";

export const handler = async (event) => {
  const { id } = event.pathParameters;

  // Query (no Scan): lee solo la partición de este TODO, ya ordenada por sk
  const items = [];
  let lastKey;

  do {
    const result = await ddb.send(
      new QueryCommand({
        TableName: AUDIT_TABLE_NAME,
        KeyConditionExpression: "todoId = :id",
        ExpressionAttributeValues: { ":id": id },
        ExclusiveStartKey: lastKey,
      })
    );
    items.push(...(result.Items ?? []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  const history = items.map(({ eventType, occurredAt, snapshot }) => ({
    eventType,
    occurredAt,
    snapshot,
  }));

  return response(200, history);
};