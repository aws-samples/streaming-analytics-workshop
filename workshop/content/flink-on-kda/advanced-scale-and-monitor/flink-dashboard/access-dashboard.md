---
title: "Accessing the Dashboard"
chapter: false
weight: 210
---

#### To start, navigate to the streaming-analytics-workshop application we've created previously and click the button which says `Open Apache Flink Dashboard`. 

![Open Flink Web Dashboard](/images/flink-on-kda/open-flink-dashboard.png)


#### This will open a new window.

![Flink Dashboard Wide View](/images/flink-on-kda/flink-dashboard-wide-view.png?classes=border,shadow)

#### This is a running Apache Flink Web Dashboard you would access in any standard Apache Flink workload.

   {{% notice tip %}} 
The Flink Dashboard made available to Kinesis Data Analytics for Apache Flink is set to Read-Only, so tasks like deploying jars and modifying configuration are not enabled.
   {{% /notice %}} 

Take note of the following components of the Flink Dashboard, as they can be useful for troubleshooting your Flink applciations.


1. [LEFT] Running Jobs - Your running application name and the duration it has been running without manual restarts.
2. [LEFT] Task Managers - The compute nodes that are running the tasks within the application.
3. [Right] Running Job List - Contains the list of jobs running - should only ever be one within KDA
   1. The Start Time of the Application
   2. Duration the job has been running
   3. Number of Tasks (total subtasks of the application)
   4. Status - Running, Failing, Stopped, Cancelled

### Within this exercise, we'll be looking at a few common areas to look when assessing the health of your application using the Apache Flink Web Dashboard.