---
title: "Advanced Scaling Components"
chapter: true
weight: 140
---



![Application Autoscaling CW Alarm](/images/flink-on-kda/enhanced-monitoring-1.jpg)

The CloudFormation Template includes the following components:
1. Two CloudWatch Alarms for Scale Out and Scale In of your Kinesis Data Analytics for Apache Flink Application.
2. Accompanying Scale Out and Scale In Autoscaling policy actions in these alarms.
3. API Gateway Endpoint for triggering AWS Lambda (scale in and scale out)
4. Lambda function responsible for handling scale in and scale out functions.

Each of these components work in tandem to monitor the metric configured in the CloudWatch Alarm and respond to metrics accordingly. This existing alarm is configured to scale out and in based on the IncomingRecords on the existing Kinesis Data Stream. 

Let's see it in action by sending some data to the stream to observe behavior.


## But first, let's modify the CloudWatch Scale Out alarm to be more sensitive to incoming records. 
Currently, the settings are tuned to the max throughput per KPU, which is ideal for a production workload. For this lab, let's tune this setting down to a lower value to more quickly see results.

## {{%expand "1. Navigate to the CloudWatch Service Page" %}}
## Navigate to the CloudWatch Service Page and select Alarms on the left hand side.
![CloudWatch Dashboard Alarm](/images/flink-on-kda/advanced-scaling-cw-alarm.png)
.{{% /expand%}}

-----------------------------

## {{%expand "2. Modify CloudWatch Alarm" %}}

#### Click on the alarm called `KDAScaleOutAlarm` and let's identify out the important components.
![CloudWatch Dashboard Scale Out](/images/flink-on-kda/advanced-scaling-cw-scale-out.png)

#### 1) The alarm has been preconfigured for you in CloudWatch to listen for specific metrics breaching a threshold.
#### 2) The threshold is currently set to 4400 records in 1 minute which is the max throughput per KPU.
#### 3) Incoming records on this screenshot are well below the incoming records count to trigger the alarm.
#### 4) We can also see the Autoscaling policy has been set as an action out of this alarm.


#### Let's modify this CloudWatch Alarm to trigger faster to simulate a scale-out event.

#### On the top right of this screen, select `Actions` &#9660; &#5171; `Edit` and you should see the following screen:
![Edit Scale Out](/images/flink-on-kda/advanced-scaling-cw-edit-scale-out.png)

#### Set the threshold to 50 so that we can observe a scale out event in real time.


.{{% /expand%}}

-----------------------------

## {{%expand "3. Ingest Data to Kinesis Data Stream and Observe Autoscaling" %}}

#### Currently, our Kinesis Data Analytics for Apache Flink application is set to a parallelism of 1. Let's send some data to see how the throughput impacts the parallelism.

#### Head back to your already running Remote Desktop and rerun the command in terminal to send data to our Kinesis Data Stream:

```
java -jar C:\Users\Administrator\Desktop\workshop-resources\amazon-kinesis-replay-0.1.0.jar -objectPrefix artifacts/kinesis-analytics-taxi-consumer/taxi-trips-partitioned.json.lz4 -aggregate -streamName streaming-analytics-workshop -speedup 100
```

#### After running this command, let's go back to the CloudWatch Alarm page to watch the IncomingRecords breach our existing threshold.

#### You can see a breach in the top right of the screen if it shows  ⚠️ In Alarm in the top right of the metrics screen.



![In Alarm](/images/flink-on-kda/cw-alarm-in-alarm.png)

From here, navigate back to your Kinesis Data Analytics application and see if the parallelism has been impacted by this alarm.

![Parallelism Updated](/images/flink-on-kda/parallelism-updated-cw-alarm-scale-out.png)






.{{% /expand%}}
------------------------------------------


{{% notice warning %}} 
Once you've validated that it has scaled out, please stop the producer on your remote desktop, otherwise your application will continue to scale.
{{% /notice %}} 

 Turning off the producer should show an inverse effect, causing the application to trigger the `KDAScaleInAlarm`, and the application parallelism should scale back down to 1 within 2 minutes!
