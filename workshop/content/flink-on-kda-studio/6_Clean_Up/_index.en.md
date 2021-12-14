---
title: "6. Clean Up"
menuTitle: "Clean Up"
chapter: false
weight: 10
---

Now that we have completed the workshop you can clean up (delete) the resources we created if you want to. 

#### Delete Kinesis Data Stream

1. Go to the [Kinesis Data Streams Console](https://console.aws.amazon.com/kinesis/home?region=us-east-1#/streams/list)
2. Select the data stream
3. Click on **Actions**
4. Select Delete

![delete_data_stream](/images/flink-on-kda-studio/delete_data_stream.png)

#### Delete S3 Bucket

1. Go to the [S3 Console](https://s3.console.aws.amazon.com/s3/home)
2. Select the S3 bucket
3. Click on **Empty** and follow the prompts to empty the bucket
4. Click on **Delete** and follow the prompts to delete the bucket

![delete_s3](/images/flink-on-kda-studio/delete_s3.png)

#### Delete a KDA Studio + Application

1. Go to the [Kinesis Data Analytics Console](https://console.aws.amazon.com/kinesisanalytics/home)
2. Select the streaming application
3. Click on **Actions**
4. Select Delete and follow the prompts to delete the application

![delete_streaming_app](/images/flink-on-kda-studio/delete_streaming_app.png)

5. Click on **Studio**
6. Select the studio notebook(s)
7. Click on **Actions**
8. Select delete

![delete_studio](/images/flink-on-kda-studio/delete_studio.png)

You have completed deleting the resources used in this workshop