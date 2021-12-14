---
title: "Apache Flink on Amazon Kinesis Data Analytics Studio"
menuTitle: "Apache Flink on KDA Studio"
chapter: true
weight: 10
url: "/flink-on-kda-studio/"
---

# Apache Flink on Amazon Kinesis Data Analytics Studio

In this lab we will explore Kinesis Data Analytics (KDA) via. KDA Studio Notebooks. KDA Studio Notebooks provide an interactive development experience for Apache Flink. Studio notebooks allow us to easily develop Flink applications and then deploy them as long running KDA applications. 

For this lab we will stream and analyze the [NYC Taxi Cab trips data set](https://www1.nyc.gov/site/tlc/about/tlc-trip-record-data.page) with the [SQL language in Flink](https://nightlies.apache.org/flink/flink-docs-release-1.13/docs/dev/table/sql/overview/). 

We will implement the following architecture

![Flink on KDA Studio Architecture](/images/flink-on-kda-studio/workshop_architecture.png)

This workshop has 6 steps. A breif description of each is provided below.
1. [Getting Started]({{<relref "./1_Getting_Started/">}}) - Create and/or log into your AWS account 
2. [Environment Set Up]({{<relref "./2_Enviorment_Set_Up/">}}) - Deploy the necessary AWS resources for this workshop
3. [Send Data to Kinesis Data Stream]({{<relref "./3_Send_Data_to_Kinesis_Data_Stream/">}}) - Set up and run a KDA notebook that will send sample NYC Taxi Cab data to a Kinesis Data Stream
4. [Interactive Flink Studio Notebook]({{<relref "./4_Interactive_Notebook/">}}) - Run an interactive KDA notebook that will cover key concepts for programming Flink applications via. Flink's support for the SQL language
5. [Deployable Flink Studio Notebook]({{<relref "./5_Deployable_Notebook/">}}) - Build and deploy a KDA notebook as a long running KDA application
6. [Environment Clean Up]({{<relref "./6_Clean_Up/">}}) - Delete the resources you created in your AWS account 

When you are ready continue on to [Getting Started]({{<relref "./1_Getting_Started/">}})