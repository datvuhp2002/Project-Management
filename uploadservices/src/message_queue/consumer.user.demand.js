const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils");
const { userTopicsOnDemand } = require("../configs/kafkaUserTopic");
const kafka = new Kafka({
  clientId: "upload-services",
  brokers: [process.env.KAFKA_BROKER],
});
const consumer = kafka.consumer({
  groupId: "upload-on-demand-group",
});
const runUploadConsumerOnDemand = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(userTopicsOnDemand),
    fromBeginning: false,
  });
  return new Promise((resolve, reject) => {
    consumer
      .run({
        eachMessage: async ({ topic, partition, message }) => {
          const parsedMessage = JSON.parse(message.value.toString());
          console.log(parsedMessage);
          resolve(parsedMessage);
          consumer.disconnect();
        },
      })
      .catch(reject);
  });
};
module.exports = { runUploadConsumerOnDemand };
