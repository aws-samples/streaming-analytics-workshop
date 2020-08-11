---
title: "Configure Development Environment"
menuTitle: "Configure Dev. Environment"
chapter: false
weight: 20
---

In this chapter, you will configure the development environment that builds the BEAM Jar pipeline which processes the NYC taxi data. The development environment is used to illustrate the development process. You will deploy the Beam pipeline to Amazon Kinesis Data Analytics in a managed environment at a later step.

To have a consistent experience for all attendees, you will connect to a preconfigured EC2 Instance running Windows over RDP and configure IntelliJ as the IDE.

{{% notice info %}}
If you don't like Windows or IntelliJ and are tempted to use your laptop for the lab, **please don't**. You will produce more than 12 MB/sec into a Kinesis data stream; if you use your own laptop for that, the procedure will either fail, or break the conference network, or both. You will utilise AWS cloud services in this workshop.
{{% /notice %}}
