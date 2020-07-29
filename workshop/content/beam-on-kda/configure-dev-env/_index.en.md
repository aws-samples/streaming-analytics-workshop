---
title: "Configure Development Environment"
menuTitle: "Configure Dev. Environment"
chapter: false
weight: 20
---

In this chapter, you will configure the development environment that builds the BEAM Jar pipeline whihch reads the NYC taxi data. To have a consistent experience for all attendees, you will connect to a preconfigured EC2 Instance running Windows over RDP and configure IntelliJ as the IDE.

{{% notice info %}}
Note: There will be a pre-built jar created earlier and deployed to S3, the windows machine is to show the BEAM pipiline and the build step.
{{% /notice %}}

{{% notice info %}}
If you don't like Windows or IntelliJ and are tempted to use your laptop for the lab, **please don't**. You will produce more than 12 MB/sec into a Kinesis data stream; if you use your own laptop for that, the procedure will either fail, or break the conference network, or both. You will utilise AWS cloud services in this workshop.
{{% /notice %}}
