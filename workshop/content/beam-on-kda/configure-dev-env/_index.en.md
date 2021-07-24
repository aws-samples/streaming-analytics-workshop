---
title: "Configure Development Environment"
menuTitle: "Configure Dev. Environment"
chapter: false
weight: 20
---

In this chapter, you will configure the development environment that builds the Beam pipeline which processes the NYC taxi data. The development environment is used to illustrate the development process. You will deploy the Beam pipeline to Amazon Kinesis Data Analytics in a managed environment at a later step.

To have a consistent experience for all attendees, you will use AWS Cloud9 IDE.

{{% notice info %}}
If you don't like AWS Cloud9 and are tempted to use your computer for the lab, **please don't**. You will produce up to 4 MB/sec into a Kinesis data stream; if you use your own computer for that, the procedure will either fail, or break the conference network, or both.
{{% /notice %}}
