// Consume eventos todo.completed de NotificationsQueue
export const handler = async (event) => {
  const batchItemFailures = [];

  for (const record of event.Records) {
    const attempt = record.attributes?.ApproximateReceiveCount ?? "?";
    try {
      const evt = JSON.parse(record.body);
      const todo = evt.data;

      // Mensaje "venenoso" simulado para practicar reintentos y DLQ
      // if (todo.title.includes("#fail")) {
      //   throw new Error("fallo simulado: el título contiene #fail");
      // }

      console.log(`[NOTIFICACION] Completado: "${todo.title}" (${todo.id})`);
    } catch (err) {
      console.error(`[ERROR] mensaje ${record.messageId} intento ${attempt}: ${err.message}`);
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};