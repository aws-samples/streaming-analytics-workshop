+++
title = "Cleanup"
date = 2020-07-10T11:00:27+02:00
weight = 90
chapter = true
+++

This chapter is to delete the resources after completing the workshop. If running a hosted AWS workshop, the resources and account will be available for the rest of the day to allow you to continue the workshop in your own time.

If you are running in your own account please remove all resources that you have created. Start with deleting the Kinesis Data Analytics application **beam-workshop**, then delete the Kinesis Firehose delivery stream **beam-workshop-s3**, and then the Kinesis data stream **beam-workshop**. Next, delete the Amazon CodeGuru profiling group **flink-beam-app**. Last, delete the CloudFormation template *beam-workshop** and any other resources that you have created throughout the workshop, to prevent incurring any costs.
