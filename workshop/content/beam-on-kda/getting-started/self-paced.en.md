---
title: "...on your own"
weight: 12
---

{{% notice warning %}}
Only complete this section if you are running the workshop on your own. If you are at an AWS hosted event (such as re:Invent,
Loft, Immersion Day, or any other event hosted by an AWS employee), continue with [**Configure development environment**]({{< ref "../configure-dev-env/" >}}).
{{% /notice %}}

### Running the workshop on your own

1. Launch the following CloudFormation template to create a prepared development environment in your account. Supported regions include US East (N. Virginia), US West (Oregon), Asia Pacific (Tokyo), Asia Pacific (Sydney), EU (Ireland), EU (Frankfurt), and any other region supporting these resource types: **Amazon Code Pipeline**, **Amazon CloudWatch Service**, and **Amazon Kinesis Data Analytics**.

   [![Launch CloudFormation Stack](/images/beam-on-kda/cloudformation-launch-stack.png)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=beam-workshop&templateURL=https://shausma-public.s3-eu-west-1.amazonaws.com/public/cfn-templates/streaming-analytics-workshop/streaming-analytics-workshop-beam.template.json)

1. In the following dialog, choose **Next**

   ![Launch stack](/images/beam-on-kda/cfn-1-create-stack.png)

1. Choose `beam-workshop` as **Stack name** and confirm with **Next**

1. Accept all default values on the next dialog page by clicking **Next** at the bottom of the page

1. On the last page of the dialog, confirm that CloudFormation may create IAM resource by selecting **I acknowledge that AWS CloudFormation might create IAM resources**. Click on **Create stack** at the bottom of the page.

   ![Lauch stack](/images/beam-on-kda/cfn-4-confirm-capabilities.png)

It takes approximately 10 minutes for the stack associated with this CloudFormation template to deploy. You can continue with the next step [Configure development environment]({{< ref "../configure-dev-env/" >}}) while the stack is being deployed.
