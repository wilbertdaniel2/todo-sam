import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_NAME, response } from "./utils.js";

export const handler = async () => {
  // Scan recorre toda la tabla; paginamos con LastEvaluatedKey
  const items = [];
  let lastKey;

  do {
    const result = await ddb.send(
      new ScanCommand({ TableName: TABLE_NAME, ExclusiveStartKey: lastKey })
    );
    items.push(...(result.Items ?? []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return response(200, items);
};