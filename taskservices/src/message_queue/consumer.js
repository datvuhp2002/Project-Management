"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils");
const {
  assignmentTopicsContinuous,
  assignmentProducerTopic,
} = require("../configs/kafkaAssignmentTopic");
const TaskService = require("../services/task.service");
const { runProducer } = require("./producer");
const kafka = new Kafka({
  clientId: "task-services",
  brokers: [process.env.KAFKA_BROKER],
});

const continuousConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "task-continuous-group" });
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(assignmentTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      const parsedMessage = JSON.parse(message.value.toString());
      console.log("Before handle :::", parsedMessage);
      switch (topic) {
        case assignmentTopicsContinuous.getTaskInformation:
          if (parsedMessage !== null) {
            console.log("After:::", parsedMessage);
            const assignmentRequestResultPromises = parsedMessage.map(
              async (item) => {
                return await TaskService.getListDetailTaskByTaskProperty(item);
              }
            );
            const assignmentRequestResults = await Promise.all(
              assignmentRequestResultPromises
            );
            try {
              runProducer(
                assignmentProducerTopic.receivedTaskInformation,
                assignmentRequestResults
              );
            } catch (err) {
              console.log(err);
            }
          }
          break;
        default:
          console.log("Topic không được xử lý:", topic);
      }
    },
  });
};

module.exports = { continuousConsumer };
