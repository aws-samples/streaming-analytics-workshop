---
title: "Configure AWS Cloud9"
chapter: false
weight: 21
---

The AWS Cloud9 development environment is created for you as part of the CloudFormation template. You have to complete the configuration of the environment by following the steps below:

1. Navigate to the [CloudFormation console](https://console.aws.amazon.com/cloudformation/home) and select the correct CloudFormation stack. If you are running the workshop on your own the Stack is called **streaming-analytics-workshop-beam** and if you are attending an AWS hosted event, there is only one Stack available in the account. Please copy the stack name (highlighted with a blue box in the image below). 

   ![Lauch stack](/images/beam-on-kda/cfn_c9_output.png)

2. Navigate to the [AWS Cloud9 console](https://console.aws.amazon.com/cloud9/home).If you are running the workshop on your own the environment is called **beam-workshop-devenv** and if you are attending an AWS hosted event, there is only one development environment available in the account. Once you have found the development environment, click on the "Open Ide" button.

2. The code [repository](https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer.git") is automatically cloned into your environment the first time you open the IDE.

3. Open a terminal window and execute the following commands to configure your environment.
```bash
sh ./code/misc/prepare-env.sh -s <PLEASE REPLACE THIS TEXT WITH THE STACK NAME YOU COPIED IN STEP 1>
```

4. The output should look like the following:
```json
{
    "IamInstanceProfileAssociation": {
        "AssociationId": "iip-assoc-032d69fed92042104",
        "InstanceId": "i-0eb427a9a16d8f9f9",
        "IamInstanceProfile": {
            "Arn": "arn:aws:iam::xxxxxxxxxxxx:instance-profile/beam-workshop-devenv-profile",
            "Id": "AIPAS7TKGBPA7RLYJPAAW"
        },
        "State": "associating"
    }
}
```
