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

You are now sucssfully sending data to the Kinesis Data Stream you created earlier. When you are ready proceed to the next step [Interactive Notebook]({{<relref "../4_Interactive_Notebook/">}})