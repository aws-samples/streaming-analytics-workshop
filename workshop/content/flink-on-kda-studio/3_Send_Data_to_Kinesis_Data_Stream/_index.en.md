---
title: "3. Send Data to Kinesis Data Stream"
chapter: false
disableToc: false
menuTitle: "Send Data to Kinesis Data Stream"
weight: 10
---

#### Upload Notebooks to KDA Studio

1. Go to the [Kinesis Data Analytics Console](https://console.aws.amazon.com/kinesisanalytics/home)
2. Click on **Studio**

![KDA_Stuio](/images/flink-on-kda-studio/studio_set_up.png)

3. Click on the KDA studio instance you created
4. Click **Run**
5. Click on **Open in Apache Zeppelin**
6. Click on **Import note** and upload [Nyc_Taxi_Produce_KDA_Zeppelin_Notebook.zpln](https://sharkech-public.s3.amazonaws.com/flink-on-kda/Nyc_Taxi_Produce_KDA_Zeppelin_Notebook.zpln). Open the notebook once uploaded

![KDA_Stuio](/images/flink-on-kda-studio/zeppelin_1.png)

7. Follow the steps outlined in the notebook. Run each cell in the uploaded notebook. To run a cell hit the small play button in the top left corner of each paragraph 

![Producer_Notebook](/images/flink-on-kda-studio/producer_notebook.png)

You are now sucssfully sending data to the Kinesis Data Stream you created earlier. Leave a browser window open with the notebook running. This will ensure it continues to send data to your Kinesis Data Stream as you work on the next section of the lab.

**Note** the [Nyc_Taxi_Produce_KDA_Zeppelin_Notebook.zpln](https://sharkech-public.s3.amazonaws.com/flink-on-kda/Nyc_Taxi_Produce_KDA_Zeppelin_Notebook.zpln) will send data to Kinesis Data Stream for approx 30 minutes. You may need to perodiclly rerun the notebook to sample data sending to Kinesis Data Stream. If you are working on the subseqent notebook and do not see any results check that your the [Nyc_Taxi_Produce_KDA_Zeppelin_Notebook.zpln](https://sharkech-public.s3.amazonaws.com/flink-on-kda/Nyc_Taxi_Produce_KDA_Zeppelin_Notebook.zpln) is still running and does not need to be restarted.

When you are ready proceed to the next step [Interactive Notebook]({{<relref "../4_Interactive_Notebook/">}})