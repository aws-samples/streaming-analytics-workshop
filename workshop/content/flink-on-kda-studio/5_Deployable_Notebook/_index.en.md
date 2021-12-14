---
title: "5. Deployable Notebook"
chapter: false
menuTitle: "Deployable Notebook"
disableToc: false
weight: 10
---

#### Upload Notebooks to KDA Studio

1. Go to the [Kinesis Data Analytics Console](https://console.aws.amazon.com/kinesisanalytics/home)
2. Click on **Studio**

![KDA_Stuio](/images/flink-on-kda-studio/studio_set_up.png)

3. Click on the KDA studio instance you created
4. Click on **Open in Apache Zeppelin**
5. Click on **Import note** and upload [deployable_1.13.zpln](https://sharkech-public.s3.amazonaws.com/flink-on-kda/deployable_1.13.zpln)

![KDA_Stuio](/images/flink-on-kda-studio/zeppelin_1.png)

6. Open the [deployable_1.13.zpln](https://sharkech-public.s3.amazonaws.com/flink-on-kda/deployable_1.13.zpln)

#### Build Notebook into Flink Application

1. Click on **Actions for ...**
2. Select Build deployable_1.13 and export to Amazon S3

![KDA_Stuio](/images/flink-on-kda-studio/build.png)

The build will take several minutes to complete

#### Deploy Flink Application

1. Click on **Actions for ...**
2. Select deploy deployable_1.13 as Kinesis Analytics application. Leave all defaults and click **Create Streaming Application**

![KDA_Stuio](/images/flink-on-kda-studio/deploy.png)

The deployment will take several minutes to complete. Once the deployment is complete

3. Go to the [Kinesis Data Analytics Console](https://console.aws.amazon.com/kinesisanalytics/home). You will see your application listed under the Streaming applications section
4. If your application is not already running start your application by selecting it and clicking run. Leave all defaults and click **Run**


![KDA_Application_Deployed](/images/flink-on-kda-studio/deployed_run.png)

Your studio notebook is now deployed as a Kinesis Data Analytics application! 

The application will write data to your S3 bucket. Send data to Kinesis via. the [Nyc_Taxi_Produce_KDA_Zeppelin_Notebook.zpln](https://sharkech-public.s3.amazonaws.com/flink-on-kda/Nyc_Taxi_Produce_KDA_Zeppelin_Notebook.zpln) and the deployed application will continue to stream the data to S3.

When you are ready proceed to the next step [Clean Up]({{<relref "../6_Clean_Up/">}}) if you want to delete the resources we used for this workshop