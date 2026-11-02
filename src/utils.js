import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { randomUUID } from "node:crypto";

export const TABLE_NAME = process.env.TABLE_NAME;

// DocumentClient convierte JSON <-> formato DynamoDB automáticamente
export const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Parte 2: topic de eventos y tabla de auditoría
export const AUDIT_TABLE_NAME = process.env.AUDIT_TABLE_NAME;
const TOPIC_ARN = process.env.TOPIC_ARN;
const sns = new SNSClient({});

export const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  body: body === undefined ? "" : JSON.stringify(body),
});

// Devuelve el body como objeto, o null si no es JSON válido
export const parseBody = (event) => {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return null;
  }
};

// Publica un evento de dominio en el topic SNS
export const publishEvent = async (eventType, todo) => {
  const evt = {
    eventId: randomUUID(),
    eventType,
    occurredAt: new Date().toISOString(),
    source: "todos-api",
    data: todo,
  };

  await sns.send(
    new PublishCommand({
      TopicArn: TOPIC_ARN,
      Message: JSON.stringify(evt),
      // El atributo permite que SNS filtre sin abrir el mensaje
      MessageAttributes: {
        eventType: { DataType: "String", StringValue: eventType },
      },
    })
  );

  return evt;
};