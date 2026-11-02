import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, AUDIT_TABLE_NAME } from "./utils.js";

// Consume eventos de AuditQueue y los guarda en AuditTable
export const handler = async (event) => {
  const batchItemFailures = [];

  for (const record of event.Records) {
    try {
      const evt = JSON.parse(record.body);

      await ddb.send(
        new PutCommand({
          TableName: AUDIT_TABLE_NAME,
          Item: {
            todoId: evt.data.id,
            // occurredAt#eventId => orden cronológico + idempotencia
            sk: `${evt.occurredAt}#${evt.eventId}`,
            eventId: evt.eventId,
            eventType: evt.eventType,
            occurredAt: evt.occurredAt,
            snapshot: evt.data,
          },
        })
      );

      console.log(`[AUDIT] ${evt.eventType} -> ${evt.data.id}`);
    } catch (err) {
      console.error(`[ERROR] mensaje ${record.messageId}: ${err.message}`);
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  // Solo se reintentan los mensajes que fallaron
  return { batchItemFailures };
};