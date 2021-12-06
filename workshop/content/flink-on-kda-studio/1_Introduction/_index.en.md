---
title: "Introduction"
chapter: false
weight: 10
---

In this lab we will explore Kinesis Data Analytics (KDA) via. KDA Studio Notebooks. KDA Studio Notebooks provide an interactive development experience for Apache Flink. Studio notebooks allow us to easily develop Flink applications and then deploy them as long running KDA applications. 

For this lab we will stream and analyze the [NYC Taxi Cab trips data set][2]. We will use the [SQL language in Flink][1]. 

We will implement the following architecture during this workshop

![Flink on KDA Studio Architecture](/images/flink-on-kda-studio/workshop_architecture.png)

This workshop has 6 steps. A breif description of each is provided below.
1. Getting Started - Create and/or log into your AWS account 
2. AWS Enviorment Set Up - Deploy the necessary AWS resources for this workshop
3. Sending Data to Kinesis Data Stream - Set up and run a KDA notebook that will send sample NYC Taxi Cab data to a Kinesis Data Stream
4. Interactive Flink Studio Notebook - Run an interactive KDA notebook that will cover key concepts for programming Flink applications via. Flink's support for the SQL language
5. Deployable Flink Studio Notebook - Build and deploy a KDA notebook as a long running KDA application
6. AWS Enviorment Clean Up - Delete the resources you created in your AWS account 

[1]:https://nightlies.apache.org/flink/flink-docs-release-1.13/docs/dev/table/sql/overview/
[2]:https://www1.nyc.gov/site/tlc/about/tlc-trip-record-data.page
