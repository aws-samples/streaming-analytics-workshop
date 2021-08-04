---
title: "Create a Firehose delivery stream"
chapter: false
weight: 32
---

Next you create an Amazon Kinesis Data Firehose delivery stream to allow for transforming and enrichment of the source data to eventually store into an S3 bucket. The delivery stream will consume data from the data stream that has been created earlier. The delivery stream also enriches the events that are persisted to Amazon S3 by means of an AWS Lambda function that has already been pre-created for the lab.

Each event that is persisted in the Kinesis stream is automatically assigned an _approximate arrival timestamp_ in the event meta data. The Lambda function is simply adding the _approximate arrival timestamp_ from the meta data into the payload of the message when it is written to Amazon S3.

The Lambda function that does this can be found under [Services->Lambda](https://console.aws.amazon.com/lambda/) and as _\*EnrichEventsLambda\*_ in the middle of the name.

```js
function enrichPayload(record) {
  const payload = JSON.parse(
    Buffer.from(record.data, "base64").toString("utf8")
  );
  const timestamp = new Date(
    record.kinesisRecordMetadata.approximateArrivalTimestamp
  ).toISOString();

  const enrichedPayload = Object.assign(
    { approximate_arrival_timestamp: timestamp },
    payload
  );

  return Buffer.from(JSON.stringify(enrichedPayload) + "\n").toString("base64");
}
```

In this way, the streaming and the batch pipeline can refer to the same timestamp so we can get the same result for the batch and streaming pipeline. Follow the steps in this chapter to create the delivery stream.
