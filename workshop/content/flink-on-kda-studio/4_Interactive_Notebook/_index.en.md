---
title: "4. Interactive Notebook"
chapter: false
disableToc: false
menuTitle: "Interactive Notebook"
weight: 10
---

#### Upload Notebooks to KDA Studio

1. Go to the [Kinesis Data Analytics Console](https://console.aws.amazon.com/kinesisanalytics/home)
2. Click on **Studio**

![KDA_Stuio](/images/flink-on-kda-studio/studio_set_up.png)

3. Click on the KDA studio instance you created
4. Click on **Open in Apache Zeppelin**
5. Click on **Import note** and [upload sql_1.13.zpln](https://sharkech-public.s3.amazonaws.com/flink-on-kda/sql_1.13.zpln)

![KDA_Stuio](/images/flink-on-kda-studio/zeppelin_1.png)

6. Follow the steps outlined in the notebook. Run each cell in the uploaded notebook. To run a cell hit the small play button in the top left corner of each 

![Interactive_Notebook](/images/flink-on-kda-studio/interactive_notebook.png)

When you complete running the entire interactive notebook proceed to the next step [Deployable Notebook]({{<relref "../5_Deployable_Notebook/">}})